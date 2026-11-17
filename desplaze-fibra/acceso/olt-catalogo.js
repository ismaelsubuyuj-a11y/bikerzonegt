/* Catálogo de referencia de OLT del mercado y perfiles de ONT.
   Valores típicos de referencia: confirme siempre con la hoja técnica del fabricante antes de diseñar. */
const CATALOGO_OLT = [
  /* VSOL: modelos vigentes según su catálogo público. Número de puertos y tecnología según el fabricante.
     La potencia TX es una referencia típica por tecnología; confírmela con la hoja técnica de VSOL. */
  {id: "vsol-v1600gs-r", nombre: "VSOL V1600GS-R · 1 PON GPON (mini)", tecnologia: "GPON", puertosPON: 1, txDbm: 3.0},
  {id: "vsol-v3600gs", nombre: "VSOL V3600GS · 1 PON combo XGS/XG/GPON", tecnologia: "XGS-PON", puertosPON: 1, txDbm: 4.0},
  {id: "vsol-v1600g0-b", nombre: "VSOL V1600G0-B · 4 PON GPON", tecnologia: "GPON", puertosPON: 4, txDbm: 3.0},
  {id: "vsol-v1600xg02", nombre: "VSOL V1600XG02 · 2 PON XG/XGS-PON", tecnologia: "XGS-PON", puertosPON: 2, txDbm: 4.0},
  {id: "vsol-v1600xg02-w", nombre: "VSOL V1600XG02-W · 2 PON GPON/XG/XGS-PON (WDM)", tecnologia: "XGS-PON", puertosPON: 2, txDbm: 4.0},
  {id: "vsol-v1600g1-r", nombre: "VSOL V1600G1-R · 8 PON GPON (capa 3)", tecnologia: "GPON", puertosPON: 8, txDbm: 3.0},
  {id: "vsol-v3600g1-c", nombre: "VSOL V3600G1-C · 8 PON XGS/XG/GPON combo", tecnologia: "XGS-PON", puertosPON: 8, txDbm: 4.0},
  {id: "vsol-v1600g2-r", nombre: "VSOL V1600G2-R · 16 PON GPON (capa 3)", tecnologia: "GPON", puertosPON: 16, txDbm: 3.0},
  {id: "vsol-v5600x2", nombre: "VSOL V5600X2 · chasis 2 ranuras, hasta 32 PON", tecnologia: "XGS-PON", puertosPON: 32, txDbm: 4.0},
  {id: "vsol-v5600x7", nombre: "VSOL V5600X7 · chasis 7 ranuras, hasta 112 PON", tecnologia: "XGS-PON", puertosPON: 112, txDbm: 4.0},

  {id: "hw-ma5800-x2", nombre: "Huawei MA5800-X2 · GPON", tecnologia: "GPON", puertosPON: 16, txDbm: 3.0},
  {id: "hw-ma5800-x7", nombre: "Huawei MA5800-X7 · XGS-PON", tecnologia: "XGS-PON", puertosPON: 16, txDbm: 5.0},
  {id: "zte-c320", nombre: "ZTE C320 · GPON", tecnologia: "GPON", puertosPON: 16, txDbm: 3.5},
  {id: "zte-c620", nombre: "ZTE C620 · XGS-PON", tecnologia: "XGS-PON", puertosPON: 16, txDbm: 5.0},
  {id: "nokia-fx16", nombre: "Nokia ISAM FX-16 · GPON", tecnologia: "GPON", puertosPON: 16, txDbm: 3.0},
  {id: "fh-an5516", nombre: "FiberHome AN5516-06 · GPON", tecnologia: "GPON", puertosPON: 8, txDbm: 3.0},
  {id: "gen-gpon-8", nombre: "Genérica GPON 8 PON", tecnologia: "GPON", puertosPON: 8, txDbm: 3.0},
  {id: "gen-xgs-16", nombre: "Genérica XGS-PON 16 PON", tecnologia: "XGS-PON", puertosPON: 16, txDbm: 4.0}
];

const PERFIL_ONT = {
  "B+": {nombre: "GPON clase B+ (−27 dBm)", sensDbm: -27},
  "C+": {nombre: "GPON clase C+ (−28 dBm)", sensDbm: -28},
  "XGS": {nombre: "XGS-PON (−28 dBm)", sensDbm: -28}
};

/* Pérdida típica de inserción de splitters PLC */
const SPLITTER_DB = {"1x2": 3.5, "1x4": 7.0, "1x8": 10.5, "1x16": 13.5, "1x32": 16.5};
