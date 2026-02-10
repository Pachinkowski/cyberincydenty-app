export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // GET - pobranie listy incydentów z paginacją
    if (request.method === 'GET') {
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        try {
            const { results } = await env.DB.prepare(
                'SELECT * FROM incydenty ORDER BY data_incydentu DESC LIMIT ? OFFSET ?'
            ).bind(limit, offset).all();

            const { results: countResults } = await env.DB.prepare(
                'SELECT COUNT(*) as total FROM incydenty'
            ).all();

            return Response.json({
                incidents: results,
                total: countResults[0].total,
                page: page
            });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    // POST - dodanie nowego incydentu
    if (request.method === 'POST') {
        try {
            const data = await request.json();

            // Walidacja długości pól
            if (data.klient.length > 30) {
                return Response.json({ error: 'Klient - max 30 znaków' }, { status: 400 });
            }
            if (data.opis_incydentu.length > 500) {
                return Response.json({ error: 'Opis - max 500 znaków' }, { status: 400 });
            }

            await env.DB.prepare(
                'INSERT INTO incydenty (klient, opis_incydentu, data_incydentu, skutki_incydentu, rozwiazania_cloudflare) VALUES (?, ?, ?, ?, ?)'
            ).bind(
                data.klient,
                data.opis_incydentu,
                data.data_incydentu,
                data.skutki_incydentu,
                data.rozwiazania_cloudflare
            ).run();

            return Response.json({ success: true }, { status: 201 });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    // DELETE - usunięcie incydentu
    if (request.method === 'DELETE') {
        try {
            const id = url.searchParams.get('id');
            
            await env.DB.prepare('DELETE FROM incydenty WHERE id = ?').bind(id).run();

            return Response.json({ success: true });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    return Response.json({ error: 'Nieobsługiwana metoda' }, { status: 405 });
}
