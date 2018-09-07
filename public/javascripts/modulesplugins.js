/**
 *@author Guiala Jean Roger
 *@module Plugin toutes les fonctions d'interaction et de création de vue
 * Fichier contenant les fonctions et les variables de base relatif à la carte, ces fonctions sont appellées et utilisées par d'autres fichier 
 * Javascript
 */
/**
 * chargement des variables générale et des fonctions qui vont etre utilisé par d'autres pages JS
 */

var extent = [-378305.8099675195, 6008151.219241469, 1320649.5712336518, 7235612.7247730335];
//var extent = [-357823.2365, 6037008.6939, 1313632.3628, 7230727.3772];
var projection = new ol.proj.Projection({
    code: 'EPSG:2154',
    extent: extent,
    units: 'm',
    axisOrientation: 'neu'
}); // definition du EPSG 2154
var zoom = 2.5;
ol.proj.addProjection(projection); //inclusion du EPSG dans openlayer
var proj2154 = ol.proj.get('EPSG:2154'); //recupération de la projection
proj2154.setExtent(extent);
var projectionExtent = proj2154.getExtent(); //recupération de l'étendu de la projection 
var variable = 21;
var resolutions = new Array(variable);
var matrixIds = new Array(variable);
var maxResolution = ol.extent.getWidth(projectionExtent) / 256; //recupérationd des résolutions
for (var i = 0; i < variable; ++i) {
    matrixIds[i] = 'EPSG:2154:' + i;
    resolutions[i] = (maxResolution) / Math.pow(2, i);
    //alert(resolutions[i]);
}
//setup source couche qui va etre utilisé pour toute les aire parcellaires
var sourceL = new ol.source.VectorTile({
    tilePixelRatio: 1,
    format: new ol.format.MVT(),
    tileGrid: ol.tilegrid.createXYZ({
        extent: extent,
        resolutions: resolutions,
        origin: ol.extent.getTopLeft(projectionExtent),

    }),
   //url: 'http://127.0.0.1:8080/geoserver/gwc/service/tms/1.0.0/test:aire_p@EPSG:2154@pbf/{z}/{x}/{-y}.pbf',
    url: 'http://geoserver.sig-inao.fr/geoserver/gwc/service/tms/1.0.0/inao:aire_parcellaire@EPSG:2154@pbf/{z}/{x}/{-y}.pbf',
    crossOrigin: 'anonymous',
});
var view = new ol.View({ 
    projection: "EPSG:2154",
    center: [489353.59, 6587552.20], //coord en 2154
    minZoom:1.5,
    zoom: zoom
});
/**
 * Déclaration de la carte ici, ol::Map
 */
var map = new ol.Map({  
    target: 'map',
    renderer: 'canvas', //canvas,WebGL,DOM
    view:view
});


/**
 * En fonction du format, initialise la carte IGN
 * @param {String} name 
 */
function checkformat(name) {
    switch(name){
        case "CADASTRALPARCELS.PARCELS.L93": {return "image/png"; break;}
        case "CADASTRALPARCELS.PARCELS": {return "image/png"; break;}
        case "ADMINEXPRESS_COG_CARTO_2017": {return "image/png"; break;}
        default: {return "image/jpeg"; break;}
    }
}

/**
 * Fonction qui initialise une couche de l'IGN
 * @param {String} name 
 */
function setIgnLayer(name) {
    format = checkformat(name);
    map.addLayer(
   new ol.layer.Tile({
       name:name,
        source : new ol.source.GeoportalWMTS({
            layer : name,
            olParams : {
                format : format
            }
        })
    })
    
);
}



/**
 * fonction qui retire les doublons dans un tableau d'objet
 */
function removeDuplicates(arr, key) {
    if (!(arr instanceof Array) || key && typeof key !== 'string') {
        return false;
    }
    if (key && typeof key === 'string') {
        return arr.filter((obj, index, arr) => {
            return arr.map(mapObj => mapObj[key]).indexOf(obj[key]) === index;
        });
    }
}

/**
 * charge les couches en session
 * @param {Array} val tableau de couches en session
 */
function loadLayersess(val) {
    for (var i = 0; i < val.length; i++) {
        layerAdder(val[i]);
    }
    fitToextent(val[val.length - 1].valeur);
}
/**
 * Fonction qui charge la session
 * @param {*} handleData 
 */
function fetchSess(handleData) {
    $.ajax({
        url: "/session/couches/NULL",
        type: 'GET',
        dataType: "json",
        success: data => {
            handleData(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus); alert("Error: " + errorThrown);
        }
    });
}

/**
 * mis à jour de la sesison
 * NE FONCTIONNE PAS ENCORE
 * @param {*} data 
 */
function updateSess(data){
    $.ajax({
        url:"/session/couches/NULL",
        type:'POST',
        data:'session=' + data,
       // dataType:"json",
        success:filter=>{
            alert("changement");
            console.log(filter);
        }
        
    });
}


/**
 * Charge la carte de base et affiche les couches en session si il y en a 
 */
function LoadLayers() {
    fetchSess(data => {
        let sess = data.filter;
        if (sess.length > 0) {
            let filtered = removeDuplicates(sess, 'valeur');
            loadLayersess(filtered);

        } else {
            //map.addLayer(layerMVT); //ajout de la couche à la carte
            map.getView().setZoom(zoom);
            successMessage('Chargement terminé', 'Bienvenue sur la plateforme de visualisation cartographique');
        }

    });
}




/**
 * Fonction qui affiche un message une fois que la carte a chargé pour la premiere fois.
 * @param {libelle} string titre du message
 * @param {valeur} string contenu du message
 */
function successMessage(libelle, valeur) {
    setTimeout(function () {
        toastr.options = {
            closeButton: true,
            progressBar: true,
            showMethod: 'slideDown',
            timeOut: 2500
        };
        toastr.success(libelle, valeur);
    }, 1300);
}





/**
 * 
 * @param {string} valeur ce qui est recherché, dénomination ou appellation 
 * 
 */
function fitToextent(valeur) {
    $.ajax({
        url: "/extendTest/" + valeur,
        type: 'GET',
        dataType: "json",
        success: function (data) {

            var ex = [data[0].st_xmin, data[0].st_ymin, data[0].st_xmax, data[0].st_ymax];

            map.getView().fit(ex, map.getSize());
        }
    });

}

/**
 * vérifie si on a cliqué ou pas sur la barre de menu
 * @param {number} checker 
 */
function sidebarClicked(checker) {
    if (checker == 0) {
        clickSidebar();
        checker = 1;
    }
}
/**
 * Fonction qui crée une couche sur la carte en fonction du type et de la valeur
 * @param {Objec{type,valeur}} element contient le type et le nom de la couche
 
 * utilise les fonctions:
 * createLayerRow,
 * SucessMessage,
 * fitToextent,
 * clickSidebar
 */
function layerAdder(element) {
    try {
        map.addLayer(new ol.layer.VectorTile({
            opacity: 0.8,
            source: sourceL,
            name: element.valeur, // nom dela couche
            style: (feature => {
                if (feature.get(element.type) === element.valeur) {
                    return stylesFill['red'];
                } else {
                    return new ol.style.Style({});
                }
            }),
        }));
        loadLayerEvents(element);
    } catch (e) {
        swal({
            title: "ERREUR lors du chargement de la couche : " + element.valeur + " " + e,
            text: "Transmettre l'erreur ci-dessus à votre administrateur ou éssayez de réactualiser la page.",
            type: "warning",
            showConfirmButton: true,
        });
    }
}
function loadLayerEvents(element){
    makeAireGeo(element.valeur,aire=>{
        if(typeof aire !=='undefined' && aire.length >0){
            makeLayerByCoord(aire,element.valeur);
            createRow(element,"aireGeo");
          }else{
            createRow(element,"pasAireGeo");
          }
    });
   
    successMessage("ajout termnié avec succès", "ajout de la couche " + element.valeur);
    fitToextent(element.valeur);
    sidebarClicked(clicked);
}


function deleteSessLayer(id) {
    $.ajax({
        type: 'delete',
        url: "/session/couches/" + id,
    });
}

/**
 * Retourne la couche vectorielle en fonction de son nom
 * @param {String} name 
 */
function getLayer(name) {
    let couche;
    map.getLayers().forEach(layer => {
        
            if (layer.get('name') != undefined && layer.get('name') == name) {
                couche = layer;
            }
        
    });
    return couche;
}

/**
 * Supprime une couche chargée ainsi que l'aire geo associé
 * @param {String} nom Nom de la couche
 */
function removeLayer(nom, id) {
    let layer = getLayer(nom);
    if (layer != undefined) {
        if(layer instanceof ol.layer.VectorTile){
            let aire_geo = getLayer("geo"+nom);
            if(aire_geo !=undefined){
                map.removeLayer(aire_geo);
            }
        }
        try {
            map.removeLayer(layer);
            deleteSessLayer(id);
            fetchSess(dat=>{
                let data = dat.filter;
              
                if(data.length >0){
                    fitToextent(data[data.length - 1].valeur); //zoom sur le dernier élément du tableau
                }else{
                    
                    LoadLayers();
                   
                }
             
            });
            map.updateSize();
            successMessage("Couche retiré avec succès", "Suppression de la couche " + nom);

        } catch (e) {
            alert("error " + e);
        }
    }

}


/**
 * Change la couche d'une couche
 * @param {String} layerName 
 * @param {String} couleur 
 * @param {String} code 
 */
function ChangeLayerColor(type, layerName, code) {
    let layer = getLayer(layerName);
    if (layer != undefined) {
        let style = styleColorFill(code);
        layer.setStyle((feature => {
            if (feature.get(type) === layerName) {
                return style;
            } else {
                return new ol.style.Style({});
            }
        }));
        map.updateSize();
    }
}

function changeAireColor(layerName,code){
    
    let layer = getLayer(layerName);
  
    if(layer !=undefined){
        
        let style = styleColorStroke(code);
        layer.setStyle((feature=>{
            return style;
        }));
        map.updateSize();
    }else{

    }
}

function makeAireGeo(denomination,callback){
    $.ajax({
        url: "/aire_geo/" + denomination,
        type: 'GET',
        dataType: "json",
        success: coord=>{
          callback(coord);
           
        }
    });
}

function fetchAireGeo(denomination,callback){
    $.ajax({
        url:"/aire_geo/getInfo/"+denomination,
        type:'GET',
        dataType:"json",
        success: aire_geo=>{
            callback(aire_geo);
        }
    });
}

function makeLayerByCoord(coord,denom){
    let name = String("geo"+denom); 
    try{
        map.addLayer(new ol.layer.Vector({
            projection:"EPSG:2154",
            name:name,
            source: new ol.source.Vector({
                projection:"EPSG:2154",
                features: (new ol.format.GeoJSON()).readFeatures(coord[0].geom)
            }),
            style: stylesStroke.yellow
        }));
    }catch(e){
        console.log("erreur " +e);
    }
    
}