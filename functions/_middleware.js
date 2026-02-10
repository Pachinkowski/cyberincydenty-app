export async function onRequest(context) {
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'VybehajTo2025!'; // ZMIEŃ TO HASŁO!

    const authorization = context.request.headers.get('Authorization');

    if (!authorization) {
        return new Response('Wymagane logowanie', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Cyberincydenty"'
            }
        });
    }

    const [scheme, encoded] = authorization.split(' ');
    if (!encoded || scheme !== 'Basic') {
        return new Response('Nieprawidłowe uwierzytelnienie', { status: 401 });
    }

    const decoded = atob(encoded);
    const [user, pass] = decoded.split(':');

    if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
        return new Response('Nieprawidłowe dane logowania', { status: 401 });
    }

    return context.next();
}
