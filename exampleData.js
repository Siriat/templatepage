const exampleData = {
  Number: 14999,
  Issued: Date.parse('2020-10-12') / 1000,
  Due: Date.parse('2020-11-12') / 1000,

  Invoicer: {
    Name: 'Thunderous Applause',
    Street1: '812 Automated Rd',
    Street2: null,
    City: 'New York',
    State: 'NY',
    Zip: '10003',
    Email: 'applause@thunder.com',
    Phone: '+1-800-111-1111',
    Website: 'applause.com',
  },

  Client: {
    Name: 'Monkeys Juggling',
    Street1: '100 Banana St',
    City: 'Bananaberg',
    State: 'NJ',
    Zip: '07048',
  },

  Items: [
    {
      Description: 'Wolf Whistle',
      Price: 35,
      Quantity: 3,
      Total: 105,
    },
    {
      Description: 'Bravo',
      Price: 30,
      Quantity: 17,
      Total: 510,
    },
  ],

  Subtotal: 615,
  Deduction: null,
  Taxes: null,
  Total: 615,





  "id": 3,
  "folio": "ME-202",
  "cliente": "PEMEX",
  "fecha": "2024-08-30T00:00:00.000Z",
  "nota": "SODADK",
  "Referencia": {
    "Proyecto": {
      "cliente_final": "pemex",
      "ejecutivo": "federico",
      "id": 1,
      "nombre": "refineria",
      "ubicacion": "tula"
    },
    "autorizada": "",
    "cliente": {
      "contacto": "ing. laura",
      "correo": "laura@pemex.gob.mx",
      "domicilio": 5100,
      "empresa": "PEMEX",
      "id": 3,
      "rfc": "PEM701101DD2",
      "telefono": "55-16-22-00-00"
    },
    "contacto": "ING. 2",
    "estatus": "",
    "fecha": "2024-08-30T00:00:00.000Z",
    "fecha_caducidad": "2024-09-30T00:00:00.000Z",
    "folio": "ME-202",
    "id": 3,
    "items": [
      {
        "Duplicado_en_producto": null,
        "_error_": {
          "Duplicado_en_producto": "TypeError: 'Record' object is not iterable"
        },
        "ajuste": 0,
        "cantidad": 1,
        "coti": {
          "tableId": "Cotizacion2",
          "rowId": 0
        },
        "descripcion_detalle": "",
        "id": 3,
        "marca": "Gai-tronics",
        "me_cotizacion": {
          "tableId": "Cotizacion2",
          "rowId": 3
        },
        "nota": "",
        "notas": "",
        "partida": "1",
        "precio_serv": 0,
        "product_id": "013-02-0095-005",
        "producto": {
          "tableId": "Producto",
          "rowId": 152
        },
        "producto_descripcio": "Elemec3\n  Controller\n    -Analog/VoIP Telephone Interface\n    ",
        "producto_precio2": 83374.59999999999,
        "total": 83374.59999999999
      }
    ],
    "multiplicador": 10,
    "nota": "SODADK"
  },
  "items": {
    "tableId": "Items_cotizacion",
    "rowIds": [
      3
    ]
  },
  "Proyecto": "refineria",
  "fecha_caducidad": "2024-09-30T00:00:00.000Z",
  "autorizada": "",
  "contacto": "ING. 2",
  "multiplicador": 10,
  "estatus": ""






};
