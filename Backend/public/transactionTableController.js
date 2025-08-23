$(document).ready(function() {
    // Initialize DataTable
    const table = $('#transactionTable').DataTable({
      dom: '<"top"Bf>rt<"bottom"lip><"clear">', // Layout control
      buttons: [
        {
          extend: 'copy',
          className: 'btn btn-sm btn-outline-info'
        },
        {
          extend: 'csv',
          className: 'btn btn-sm btn-outline-info'
        },
        {
          extend: 'excel',
          className: 'btn btn-sm btn-outline-info'
        },
        {
          extend: 'print',
          className: 'btn btn-sm btn-outline-info'
        }
      ],
      responsive: true,
      order: [[0, 'desc']], // Sort by date descending by default
      columnDefs: [
        { 
          targets: 0, // Date column
          type: 'date', // Proper date sorting
          render: function(data) {
            return data ? new Date(data).toLocaleDateString() : '';
          }
        },
        {
          targets: 5, // Amount column
          render: function(data) {
            return parseFloat(data).toLocaleString('en-US', {
              style: 'currency',
              currency: 'INR'
            });
          }
        }
      ],
      initComplete: function() {
        // Add dropdown filters for Type, Category, and Frequency
        this.api().columns([2, 3, 4]).every(function() {
          const column = this;
          const select = $('<select class="form-select form-select-sm mb-2"><option value="">All ' + $(column.header()).text() + '</option></select>')
            .appendTo('#transactionTableControls')
            .on('change', function() {
              const val = $.fn.dataTable.util.escapeRegex($(this).val());
              column.search(val ? '^' + val + '$' : '', true, false).draw();
            });
          
          column.data().unique().sort().each(function(d) {
            select.append('<option value="' + d + '">' + d + '</option>');
          });
        });
      }
    });
    
    // Custom search for description column
    $('<input type="text" class="form-control form-control-sm mb-2" placeholder="Search descriptions...">')
      .appendTo('#transactionTableControls')
      .on('keyup', function() {
        table.column(1).search(this.value).draw();
      });
  });