export const validarRut = (rut) => {
    if (!rut || typeof rut !== 'string') return false;
    
    const rutLimpio = rut.replace(/[\.\s]/g, '').toLowerCase();

    if (!/^[0-9]+-[0-9k]$/.test(rutLimpio)){
        return false
    };

    const [numero, dv] = rutLimpio.split('-');
    
    let M = 0, S = 1;
    let T = parseInt(numero, 10);
    for (; T; T = Math.floor(T / 10)) {
        S = (S + T % 10 * (9 - M++ % 6)) % 11;
    }
    
    const dvCalculado = S ? (S - 1).toString() : 'k';

    return dvCalculado === dv;
};

export const calcularDV = (rut) => {
    let m = 0, s = 1;
    let t = parseInt(rut, 10);

    for (; t; t = Math.floor(t / 10)) {
        s = (s + t % 10 * (9 - m++ % 6)) % 11;
    }

    const dv = s ? (s - 1).toString() : 'K';
    return `${rut}-${dv}`;
}