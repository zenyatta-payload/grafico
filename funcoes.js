
 
$(document).ready(function(){
 
$.getJSON("imoveis.json", function(dados){
  //console.log(dados);
 
  $('#tblImoveis').DataTable({
      //"dom": "Bfrtip",
      //buttons: [{extend: 'copy',text: 'Copiar'}, 'excel', 'pdf'],
      "data": dados,
      "columns": [
          { "data": "endereco"},
          { "data": "bairro" },
          { "data": "cidade" },
          { "data": "modalidadeVenda" },
          { "data": "precoOferta"  }, //,render: $.fn.dataTable.render.number( ',', '.', 0, 'R$' ).display
          { "data": "valorAvaliacao" },
          { "data": "porcentagemDesconto" },
      ],
      "columnDefs": [{
          "render": function(data){
                      data = data.replace(".","").replace(",",".");
                      return parseFloat(data).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
                    },
          "targets": [4,5]
      },
      {
          "render": function ( data, type, row ) {
                      //return data.replace('.',',') + '%';
                      return parseFloat(data).toLocaleString() + '%';
                    },
          "targets": [6]
      },
      {
          "render": function ( data, type, row ) {
                      return data.trim();
                    },
          "targets": [0,1,2]
      }
      ],
      oLanguage: {
          sLengthMenu:   "Mostrar _MENU_ registros",
          sInfo:         "Mostrando de _START_ até _END_ de _TOTAL_ registros",
          sInfoEmpty:    "Mostrando de 0 até 0 de 0 registros",
          sInfoFiltered: "(filtrado de _MAX_ registros no total)",
          sSearch:       "Procurar:",
          oPaginate: {
              sFirst:    "Primeiro",
              sPrevious: "Anterior",
              sNext:     "Seguinte",
              sLast:     "Último"
          },
          oAria: {
              sSortAscending:  ": Ordenar colunas de forma ascendente",
              sSortDescending: ": Ordenar colunas de forma descendente"
          }
      },
      "language": {
        "decimal": ",",
        "thousands": "."
      },
      lengthChange: true,

      initComplete: function () {
        this.api().columns().every( function () {
          var column = this;
          var select = $('<select class="browser-default custom-select form-control-sm"><option value="" selected>Filtrar</option></select>')
              .appendTo( $(column.footer()).empty() )
              .on( 'change', function () {
                  var val = $.fn.dataTable.util.escapeRegex(
                      $(this).val()
                  );

                  column
                      .search( val ? '^'+val+'$' : '', true, false )
                      .draw();
              } );

          //column.data().unique().sort().each( function ( d, j ) {
          column.cells('', column[0]).render('display').sort().unique().each( function ( d, j ){            
              select.append( '<option value="'+d+'">'+d+'</option>' )
          });
        });
      }

  });//.buttons().container().appendTo( '#tblImoveis .col-md-6:eq(0)' );
 
});
 
 
 //GRAFICO C

  carregaGraficos();
    //leDadosJson('imoveis');
    
    //console.log(converteMoedaFloat('1190000,46'));

    function carregaGraficos(){
      // Carregando o pacote central e o Material Charts - versão mais recente
      google.charts.load('current', {'packages':['corechart','bar'],'language':'pt'});
      // Função de retorno para chamar a função que desenha os gráficos
      google.charts.setOnLoadCallback(
        function() { // Função anônima que chama desenhaGraficoQtdModalidade e desenhaGraficoVlrModalidade
          desenhaGraficoQtdModalidade();
          desenhaGraficoVlrModalidade();
      });
    }
    

    // Desenha gráfico de quantidade de imóveis por modalidade de venda
    // Dados a partir do arquivo JSON imóveis.json
    function desenhaGraficoQtdModalidade(){
      var dadosArray = montaTabelaQtdModalidade(); // Busca dados das linhas e colunas para o gáfico a partir do arquivo imóveis.json
      var opcoes = {
        title: 'Valor total de imóveis por modalidade de venda',

        //legend: { position: 'none' },
        width: 1000,
        height: 500,

        bars: 'horizontal',
        vAxis:{
          format: 'currency',
          title: 'Valorasd Total',
           side: 'top',
           ticks: [0, {v: 20000, f: '100'},200000000,{v: 400000000, f: '1000'},600000000,800000000,1000000000],
          logScale: true
 
        },
        hAxis:{
          title: 'Modalidade de venda',


        },
        enableInteractivity: false,
        bar: { 
          groupWidth: '100%'
        },
        annotations: {
           textStyle: {
               //color: '',
               fontSize: 16,
           },
           alwaysOutside: true,
        },
        titleTextStyle: {
              color: 'blue',    // any HTML string color ('red', '#cc00cc')
              fontSize: '20', // 12, 18 whatever you want (don't specify px)
          },
        fontName: 'Calibri',
        chartArea: {left:20,top:0,width:'50%',height:'75%'} 
      };


      // Instanciando um objeto do tipo gráfico de barras e informando a div alvo
      var tabela = google.visualization.arrayToDataTable(dadosArray);
      tabela.sort([{ column: 1, desc: true }]);
      var grafico = new google.charts.Bar(document.getElementById('chart_div'));
        grafico.draw(tabela, google.charts.Bar.convertOptions(opcoes));
      };


    // Monta uma tabela em formato de array bidimensional com os dados da Modalidade de Venda e respectiva quantidade de imóveis
    function montaTabelaQtdModalidade(){
      var dadosJson =  leDadosJson('imoveis'); // Busca dados no arquivo imoveis.json
 
      // Busca cada modalidade distinta de venda e armazena em no array modalidades
      var modalidades = [];
      var dados = [];
      var tblVlr = [];
      dados[0] = ['Modalidade de venda','Quantidade de imóveis']; // Nomes das colunas
      tblVlr[0] = ['Modalidade de venda','Valor total de imóveis',{role:'annotation'}]; // Nomes das colunas
            
      $.each(dadosJson, function(chave,valor){
        if (!modalidades.includes(valor.modalidadeVenda)) {
          // Nova modalidade encontrada
          modalidades.push(valor.modalidadeVenda);
          // Para cada modalidade de venda conta a quantidade de imóveis
          var qtd = 0;
          var valorTotal = 0;
          $.each(dadosJson, function(mchave,mvalor){
            if(mvalor.modalidadeVenda == valor.modalidadeVenda){
              qtd++;
              mValorAvaliacao = (mvalor.valorAvaliacao).replace(".","").replace(",",".");
              valorTotal += parseFloat(mValorAvaliacao);
            }
          });
          x = formataMoeda(valorTotal);
          tblVlr.push([valor.modalidadeVenda,valorTotal,x])
          dados.push([valor.modalidadeVenda,qtd]);
        }
      });
      return tblVlr;
    }       
    
    function leDadosJson(arquivoNome){
      var dadosJson = $.ajax({
      url: arquivoNome + '.json',
            dataType: 'json',
            async: false
          }).responseJSON;
       return dadosJson;
    }

    
    function calculaQtdVlrImoveis(){


    } 

    function formataMoeda(valor){
      if(valor === ""){
         valor =  0;
      }else{
         //valor = valor.replace(".","");
         //valor = valor.replace(",",".");
         //valor = parseFloat(valor);
         valor = valor.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
      }
      return valor;
   }

 

/*

      // Carregando o pacote central. Versão mais recente.
      google.charts.load('current', {'packages':['corechart']});

      // Set a callback to run when the Google Visualization API is loaded.
      google.charts.setOnLoadCallback(drawChart);


      // Função para criar e preencher a tabela, isntanciar o gráfico e desenhar
      function drawChart() {

        // Tabela com colunas, linhas e dados
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Topping');
        data.addColumn('number', 'Slices');
        data.addRows([
          ['Mushrooms', 3],
          ['Onions', 1],
          ['Olives', 1],
          ['Zucchini', 1],
          ['Pepperoni', 2]
        ]);

        // Set chart options
        var options = {'title':'How Much Pizza I Ate Last Night',
                       'width':400,
                       'height':300};

        // Isntancia um objeto gráfico e passando div html
        var chart = new google.visualization.PieChart(document.getElementById('grafico'));
        chart.draw(data, options);
      }

      */


});


