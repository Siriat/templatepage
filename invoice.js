function ready(fn) {
  if (document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function addDemo(row) {
  if (!row.fecha) {
    for (const key of ['folio', 'fecha','nota','contacto','multiplicador','estatus']) {
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
      Nombre: 'Referencia.cliente.empresa',
      Domicilio: 'Referencia.domicilio.domicilio',
      rfc: 'Referencia.cliente.rfc',
      Contacto: 'Referencia.cliente.contacto'
	  correo: 'Referencia.cliente.correo'
    }
  }    
  
  if (!row.Proyecto) {
    row.cliente = {
      cliente_final: 'Referencia.Proyecto.cliente_final',
      ejecutivo: 'Referencia.Proyecto.ejecutivo',
      nombre: 'Referencia.Proyecto.nombre',
      ubicacion: 'Referencia.Proyecto.ubicacion'
	  }
  }

  if (!row.items) {
    row.items = [
      {
        producto_descripcio: 'items[0].producto_descripcio',
        cantidad: '.cantidad',
        producto_precio: '.Price',
        total:'.total',
		partida: '.partida',
		product_id:'.product_id',
		marca: '.marca',
		nota: '.nota'

      },
      {
        producto_descripcio: 'items[1].producto_descripcio',
        cantidad: '.cantidad',
        producto_precio: '.Price',
        total:'.total',
		partida: '.partida',
		product_id:'.product_id',
		marca: '.marca',
		nota: '.nota'
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
    value = new Date(value * 1000);
  }
  moment.locale('es'); // Establece el locale a español
  const date = moment(value);
  return date.isValid() ? date.format('LL') : value; // 'LL' es un formato que incluye el nombre del mes y el día en forma extendida
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
    data.status = '';
    if (row === null) {
      throw new Error("(No data - not on row - please add or select a row)");
    }
    console.log("GOT...", JSON.stringify(row));
    if (row.References) {
      try {
        Object.assign(row, row.References);
      } catch (err) {
        throw new Error('Could not understand References column. ' + err);
      }
    }

    // Add some guidance about columns.
    const want = new Set(Object.keys(addDemo({})));
    const accepted = new Set(['Referencia']);
    const importance = ['folio', 'cliente', 'items', 'fecha'];// ['Number', 'Client', 'Items', 'Total', 'Invoicer', 'Due', 'Issued', 'Subtotal', 'Deduction', 'Taxes', 'Note'];
    if (!(row.fecha)) {
      const seen = new Set(Object.keys(row).filter(k => k !== 'id' && k !== '_error_'));
      const help = row.Help = {};
      help.seen = prepareList(seen);
      const missing = [...want].filter(k => !seen.has(k));
      const ignoring = [...seen].filter(k => !want.has(k) && !accepted.has(k));
      const recognized = [...seen].filter(k => want.has(k) || accepted.has(k));
      if (missing.length > 0) {
        help.expected = prepareList(missing, importance);
      }
      if (ignoring.length > 0) {
        help.ignored = prepareList(ignoring);
      }
      if (recognized.length > 0) {
        help.recognized = prepareList(recognized);
      }
      if (!seen.has('Referencia') && !(row.fecha)) {
        row.SuggestReferencesColumn = true;
      }
    }
    addDemo(row);
    // nos se que sea esto
    /* if (!row.Subtotal && !row.Total && row.items && Array.isArray(row.otems)) {
      try {
        row.Subtotal = row.items.reduce((a, b) => a + b.Price * b.Quantity, 0);
        row.Total = row.Subtotal + (row.Taxes || 0) - (row.Deduction || 0);
      } catch (e) {
        console.error(e);
      }
    }  */
    // invoicer, ya no se usa
  /*  if (row.Invoicer && row.Invoicer.Website && !row.Invoicer.Url) {
      row.Invoicer.Url = tweakUrl(row.Invoicer.Website);
    } */

        // Calcular los totales de los items si 'Items' está presente y es un array.
    if (row.Referencia.items && Array.isArray(row.Referencia.items)) {
      row.Referencia.items.forEach(item => {
        // Asegurarse de que cada item tenga 'Price' y 'Quantity' definidos.
        if ('producto_precio' in item && 'cantidad' in item) {
          item.total = item.producto_precio * item.cantidad;
        } else {
          throw new Error('Each item must have a Price and a Quantity defined.');
        }
      });

      // Calcular el subtotal sumando los totales de cada item.
      row.subtotal = row.Referencia.items.reduce((acc, item) => acc + item.total, 0);
    }


      // Fiddle around with updating Vue (I'm not an expert).
    for (const key of want) {
      Vue.delete(data.invoice, key);
    }
    for (const key of ['Help', 'SuggestReferencesColumn', 'Referencia']) {
      Vue.delete(data.invoice, key);
    }
    data.invoice = Object.assign({}, data.invoice, row);

    // Make invoice information available for debugging.
    window.invoice = row;
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
