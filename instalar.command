#!/usr/bin/env bash
# Doble-clic en Mac para instalar. Abre Terminal y corre el instalador.
cd "$(dirname "$0")"
bash instalar.sh
echo
printf "Presioná Enter para cerrar esta ventana… "
read -r _
