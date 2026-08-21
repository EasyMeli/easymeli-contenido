# Capturas para el CTA final

Dejá acá una **captura de pantalla real** por tema, con el nombre del guion:

    public/capturas/<tema>.png      (ej: cupones.png)

Qué mostrar: la pantalla a la que querés mandar a la gente (tu **perfil con el
link**, la página del Skool, o el botón que tienen que tocar). Vertical o el
recorte que quieras: se enmarca y se centra sola.

El video le pone encima una **flecha que rebota + un anillo que pulsa**
señalando a dónde ir. Por defecto apunta al centro (0.5, 0.42). Para moverlo:

    node scripts/ajustar-video.mjs guiones/<tema>.json --cta-x 0.5 --cta-y 0.48

(x = izquierda→derecha, y = arriba→abajo, ambos de 0 a 1.)

Si NO dejás captura, el cierre cae solo a la **tarjeta de texto** de siempre
("LINK EN MI PERFIL ↑"). No se rompe nada.
