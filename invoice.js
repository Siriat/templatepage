function ready(fn) {
  if (document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function addDemo(row) {
  if (!row.fecha) {
    for (const key of ['folio', 'fecha']) {
      if (!row[key]) { row[key] = key; }
    }
    /*
    for (const key of ['Subtotal', 'Deduction', 'Taxes', 'Total']) {
      if (!(key in row)) { row[key] = key; }
    }*/
    if (!('Note' in row)) { row.Note = '(Anything in a Note column goes here)'; }
  }
/*
  if (!row.Invoicer) {
    row.Invoicer = {
      Name: 'Invoicer.Name',
      Street1: 'Invoicer.Street1',
      Street2: 'Invoicer.Street2',
      City: 'Invoicer.City',
      State: '.State',
      Zip: '.Zip',
      Email: 'Invoicer.Email',
      Phone: 'Invoicer.Phone',
      Website: 'Invoicer.Website'
    }
  }*/
  
    if (!row.cliente) {
    row.cliente = {
      Nombre: 'cliente.Referencia.cliente',
      Domicilio: 'cliente.Referencia.domicilio',
      rfc: 'cliente.Referencia.rfc',
     // City: 'cliente.City',
     // State: '.State',
      //Zip: '.Zip'
    }
  }

  if (!row.items) {
    row.items = [
      {
        producto_descripcio: 'items[0].producto_descripcio',
        cantidad: '.cantidad',
        producto_precio: '.Price',
        total:'.total',
      },
      {
        producto_descripcio: 'items[1].producto_descripcio',
        cantidad: '.cantidad',
        producto_precio: '.Price',
        total:'.total',
      },
    ];
  }
  return row;
}

const data = {
  count: 0,
  invoice: '',
  status: 'waiting',
  tableConnected: false,
  rowConnected: false,
  haveRows: false,
};
let app = undefined;

Vue.filter('currency', formatNumberAsUSD)
function formatNumberAsUSD(value) {
  if (typeof value !== "number") {
    return value || '—';      // falsy value would be shown as a dash.
  }
  value = Math.round(value * 100) / 100;    // Round to nearest cent.
  value = (value === -0 ? 0 : value);       // Avoid negative zero.

  const result = value.toLocaleString('en', {
    style: 'currency', currency: 'USD'
  })
  if (result.includes('NaN')) {
    return value;
  }
  return result;
}

Vue.filter('fallback', function(value, str) {
  if (!value) {
    throw new Error("Please provide column " + str);
  }
  return value;
});

Vue.filter('asDate', function(value) {
  if (typeof(value) === 'number') {
    // Asume que el valor es un timestamp en segundos y lo convierte a milisegundos
    value = new Date(value * 1000);
  } else if (typeof(value) === 'string') {
    // Si el valor es una cadena ISO, crea un nuevo objeto Date a partir de ella
    value = new Date(value);
  }

  // Añade 5 horas para evitar problemas de zona horaria
  const adjustedDate = new Date(value.getTime() + (5 * 60 * 60 * 1000));

  moment.locale('es'); // Establece el locale a español
  const date = moment(adjustedDate); // Crea un objeto moment con la fecha ajustada
  return date.isValid() ? date.format('LL') : value; // Formatea o devuelve el valor original si no es válido
});







function tweakUrl(url) {
  if (!url) { return url; }
  if (url.toLowerCase().startsWith('http')) {
    return url;
  }
  return 'https://' + url;
};

function handleError(err) {
  console.error(err);
  const target = app || data;
  target.invoice = '';
  target.status = String(err).replace(/^Error: /, '');
  console.log(data);
}

function prepareList(lst, order) {
  if (order) {
    let orderedLst = [];
    const remaining = new Set(lst);
    for (const key of order) {
      if (remaining.has(key)) {
        remaining.delete(key);
        orderedLst.push(key);
      }
    }
    lst = [...orderedLst].concat([...remaining].sort());
  } else {
    lst = [...lst].sort();
  }
  return lst;
}

function updateInvoice(row) {
  try {
    if (row === null) {
      throw new Error("(No data - not on row - please add or select a row)");
    }

    console.log("Datos recibidos...", JSON.stringify(row));

    // Asegurar que cada campo necesario esté disponible en Vue para su uso en HTML
    const fieldsNeeded = [
      'folio', 'multiplicador', 'estatus',
      'items', 'cliente', 'fecha', 'nota', 'Referencia.Proyecto'
    ];
    
    // Mapeo de campos complejos o anidados para facilitar su acceso
    const adaptedData = {
      folio: row.folio,
      multipicador: row.multiplicador,
      estatus: row.estatus,
      Proyecto: row.Referencia.Proyecto,
      cliente: row.cliente,
      fecha: row.fecha,
      nota: row.nota,
      items: row.items  // Asumiendo que quieres acceder directamente a los items anidados
    };

    // Asignar los datos adaptados a Vue
    for (const [key, value] of Object.entries(adaptedData)) {
      Vue.set(data.invoice, key, value);
    }

    window.invoice = adaptedData; // Hace disponible la información de la factura para depuración
  } catch (err) {
    handleError(err);
  }
}

ready(function() {
  // Update the invoice anytime the document data changes.
  grist.ready();
  grist.onRecord(updateInvoice);

  // Monitor status so we can give user advice.
  grist.on('message', msg => {
    // If we are told about a table but not which row to access, check the
    // number of rows.  Currently if the table is empty, and "select by" is
    // not set, onRecord() will never be called.
    if (msg.tableId && !app.rowConnected) {
      grist.docApi.fetchSelectedTable().then(table => {
        if (table.id && table.id.length >= 1) {
          app.haveRows = true;
        }
      }).catch(e => console.log(e));
    }
    if (msg.tableId) { app.tableConnected = true; }
    if (msg.tableId && !msg.dataChange) { app.RowConnected = true; }
  });

  Vue.config.errorHandler = function (err, vm, info)  {
    handleError(err);
  };

  app = new Vue({
    el: '#app',
    data: data
  });

  if (document.location.search.includes('demo')) {
    updateInvoice(exampleData);
  }
  if (document.location.search.includes('labels')) {
    updateInvoice({});
  }
});
