// Definicion del namespace
var usig = usig || {};

usig.App = (function() {
    var mapa = null, layers = [];

    function redimensionarMapa() {
        $('#mapa').css('width', $(window).width()).css('height', $(window).height()).css('margin', 0);        
        if (mapa) {
            $('.olControlPanZoomBarUSIG').hide();
            mapa.updateSize();            
        }
    }

    function reposicionarControles() {
        $('.olControlPanZoomBarUSIG').css('left', 'auto').css('top', '15px').css('right', '15px').css('bottom', 'auto').show();
        $('#panel-informacion').css('height', '60%');
    }

    function crearPanelInfo() {
        // Panel de informacion
        $('#mapa > .olMapViewport').append($('#template-panel-informacion').html());
    }

    function clickHandler(e, popup) {
    	if (popup) {
    		$div = $(popup.contentDiv);
            var content = '<ul style="width: 300px; list-style-type: none; margin: 5px 0; padding: 0;">';
            $.each(e.feature, function(k, v) {
                if (v.nombreId != 'Nombre' && v.valor != '') {
                    content+='<li><b>'+v.nombre+'</b>: '+v.valor+'</li>';
                }
            });
            content+='</ul>';
            $div.append(content);
            popup.updateSize();
    		popup.show();
    	}
    }    

    function removeLayers() {
    	if (layers.length > 0) {
    		for(var i=0,l=layers.length;i<l;i++) {
        		try {
        			mapa.removeLayer(layers[i]);
        		} catch(e) {
        			console.log(e);
        		}
    		}
    		layers = [];
    	}    	
    }

    function cargarLayers() {
    	var tiposDeObra = $("input[name=tipo_obra]:checked"),
    		status = $('#status').val();
    	removeLayers();

        console.log("por cargar layers");

    	tiposDeObra.each(function(k, v){
    		var icon = usig.App.config.layers[$(this).val()].icon,
    			bgIndex = parseInt(usig.App.config.layers[$(this).val()].bg);
            layers.push(mapa.addVectorLayer('Obras', { 
    		  url: window.location.href + "ordenes?tipo_obra="+ $(this).val(),
    		  format: 'geojson',
    		  symbolizer: {
    			    externalGraphic: usig.App.config.symbols_url+'n/'+icon+'.png',
    			    backgroundGraphic: usig.App.config.backgrounds_url+bgIndex+'.png',
    			    pointRadius: usig.App.config.pointRadius
    			  },
    		  minPointRadius: usig.App.config.minPointRadius,
    		  popup: true,
    		  onClick: clickHandler
    		}));
    	});
    }

    function stopPropagation(ev) {
        if (ev.stopPropagation) {
            ev.stopPropagation();
        } else {
            ev.cancelBubble = true;
        }            
    }

    function inicializar(onReady) {        

        // Creacion de los elementos flotantes sobre el mapa
        crearPanelInfo();            

        // Cambia la ubicaciÃ³n del control de zoom y agranda el panel de info
        reposicionarControles();

        $(window).on('resize', function() {
            redimensionarMapa();
            reposicionarControles.defer(200);
        });
        
        // Esto es para evitar que los clicks sobre los elementos flotantes sobre el
        // mapa sean capturados por el mapa y generen movimientos no previstos        
        $('#b, #mapSelector, #panel-informacion, .selectboxit-container')
            .on('mousedown', stopPropagation)
            .on('dblclick', stopPropagation);
        
        $("input[name=tipo_obra], #status").change(cargarLayers);
        
        cargarLayers();
    }

    return {
    	init: function(onReady) { 
            // Elimino el "Cargando..."
            $('#mapa').empty();

            // El div del mapa tiene que ocupar toda la ventana
            redimensionarMapa();

            var mapOptions = {
                divId: 'mapa',
            	trackVisits: false,
            	includeToolbar: false,
            	zoomBar: true,
            	includeMapSwitcher: false,
            	goToZoomLevel: 7,
                baseLayer: usig.App.config.baseLayer,
                // Le cambio el extent inicial para que la Ciudad no quede tapada por el panel de info
                initBounds: usig.App.config.initBounds,
                onReady: function() { 
                    inicializar.defer(200, this, [onReady]); // Esto es para que funcione en IE 10
                }
            };
            
            mapa = new usig.MapaInteractivo(mapOptions.divId, mapOptions);
    	}
    };
})();