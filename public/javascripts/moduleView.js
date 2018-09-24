/**
 * @author Guiala Jean Roger
 * @module View toutes les fonctions d'interaction et de création de vue
 * Dans ce fichier nous mettrons toutes les intéractions avec notre vue, création de block etc...
 */

/**Fonction qui crée une div en fonction de la couche qui est chargée
 * @param {Object} data contient le type (denomination, appellation, parcelle, aire geographique) et la valeur (nom)
 */

function createGeoRow(data, situation) {
    if (situation == "aireGeo") {
        let a =
            '<span><strong>Aire géographique:&nbsp;</strong>' +
            ' <a  href="#" class=" btn btn-xs btn-white" onclick="switchLayerVisibility(\'' + data.id + '\',\'fageo\',\'geo\')">' +
            ' <i id="fageo' + data.id + '" class="fa fa-1x fa-eye"></i>' +
            ' </a>' +
            ' <a href="#" id="cpgeo' + data.id + '" class="painter btn btn-xs btn-success" >' +
            ' <i class="fa fa-1x fa-paint-brush"></i>' +
            ' </a>' +

            '</span><br><br>';
        return a;
    }
    else { return '<span><strong>Aire géographique:&nbsp; </strong><span class="badge badge-danger"> Inexistante</span><br><br>'; }
}

function createAppelRow(data) {
    let message =
        '<span><strong>Aire parcellaire:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong>' +
        ' <a  href="#" class=" btn btn-xs btn-white" onclick="switchLayerVisibility(\'' + data.id + '\',\'fa\',\'\')">' +
        ' <i id="fa' + data.id + '" class="fa fa-1x fa-eye"></i>' +
        ' </a>' +
        ' <a href="#" id="cp' + data.id + '" class="painter btn btn-xs btn-success ">' +
        ' <i class="fa fa-1x fa-paint-brush"></i>' +
        ' </a>' +
        ' <a href="#"  class=" btn btn-xs btn-primary" onclick="extentCouche(\'' + data.id + '\')">' +
        ' <i class="fa fa-1x fa-map-marker"></i>' +
        ' </a>' +
        '</span>' +

        '<div class="agile-detail">' +
        ' <a href="#" type="button" class=" btn btn-xs  btn-rounded btn-info" style="visibility: hidden;" >' +
        ' <i class="fa fa-1x fa-info-circle"></i>' +
        ' </a>' +
        ' <a href="#" class="pull-right btn btn-xs   btn-danger" onclick="deleteLayerRow(\'' + data.id + '\')">' +
        ' <i class="fa fa-1x fa-trash"></i>' +
        ' </a>' +
        '</div>';

    return message;
}

/**
 * If situation , create airegeo
 * @param {*} data 
 * @param {*} color 
 */
function makeGeoRow(data, color) {
    let name = "geo" + data.valeur;
    $('#cpgeo' + data.id).css({ 'background-color': color });
    $('#cpgeo' + data.id + '').colorpicker().on('changeColor', function (e) {
        changeAireColor(name, e.color.toString('hex'));
        $('#cpgeo' + data.id).css({ 'background-color': e.color.toString('hex') });
    });
}

/**
 * Crée une ligne avec les parametres aire geo et aire parcellaire
 * @param {*} data 
 * @param {*} situation 
 * @param {*} color 
 */
function createRow(data, situation, color) {
    $("#couches").prepend(
        '<li class="success-element" id="c' + data.id + '">' +
        '<h3 class="text-center">' + data.valeur +
        ' <a href="#" type="button" class=" btn btn-outline btn-xs btn-circle   btn-info" data-toggle="modal" data-target="#myModal6" >' +
        ' <i class="fa fa-1x fa-info"> </i>' +
        ' </a>' +
        '</h3>' +
        createGeoRow(data, situation, color) + createAppelRow(data, color) +
        ' </li>'
    );
    $('#cp' + data.id).css({ 'background-color': color });

    fetchAireGeo(data.valeur, aire_geo => {
        $('body').append(modalInfo(aire_geo));
    });

    $('body').css('overflow', 'hidden'); //solution temporaire
    $('#cp' + data.id + '').colorpicker().on('changeColor', function (e) {
        ChangeLayerColor(data.type, data.valeur, e.color.toString('rgba'));
        $('#cp' + data.id).css({ 'background-color': e.color.toString('hex') });
    });
    if (situation == "aireGeo") {
        makeGeoRow(data, color);
    }
}

function createAppelationRow(data){
    $("#couches").prepend(
        '<li class="success-element" id="couche' + data.id_aire + '">' +
        '<h3 class="text-center">' + data.lbl_aire +
        ' <a href="#" type="button" class=" btn btn-outline btn-xs btn-circle   btn-info" data-toggle="modal" data-target="#myModal6" >' +
        ' <i class="fa fa-1x fa-info"> </i>' +
        ' </a>' +
        '</h3>' +
        '<div id="options'+data.id_aire+'">'+
        '</div>'+
        ' </li>'
    );
}

function rowInexistant(typeAire){
    return "<span><strong>"+typeAire+":&nbsp; </strong><span class='badge badge-danger'> Inexistante</span><br><br>";
}

function airegeoRow(id_aire){
    let a =
    '<span><strong>Aire géographique:&nbsp;</strong>' +
    ' <a  href="#" class=" btn btn-xs btn-white" onclick="switchLayerVisibility(\'' + id_aire + '\',\'fageo\',\'geo\')">' +
    ' <i id="fageo' + id_aire + '" class="fa fa-1x fa-eye"></i>' +
    ' </a>' +
    ' <a href="#" id="cpgeo' + id_aire + '" class="painter btn btn-xs btn-success" >' +
    ' <i class="fa fa-1x fa-paint-brush"></i>' +
    ' </a>' +

    '</span><br><br>';
return a;
}

function airegeoParams(id_aire,color){
    $("#options"+id_aire).prepend(
        ''+airegeoRow(id_aire)
    );
    let name = "geo" + id_aire;
    $('#cpgeo' + id_aire).css({ 'background-color': color });
    $('#cpgeo' + id_aire + '').colorpicker().on('changeColor', function (e) {
        changeAireColor(name, e.color.toString('hex'));
        $('#cpgeo' + id_aire).css({ 'background-color': e.color.toString('hex') });
    });
}
/**
 * supprime une couche ajouté
 * @param {number} id 
 * @param {String} valeur 
 */
function deleteLayerRow(id) {
    fetchSess(data => {
        let sess = data.filter;
        sess.forEach(element => {
            if (element.id == id) {
                removeLayer(element.valeur, element.id);
                $("#c" + id).remove();
            }
        });
    });

}

/**
 * Zoom sur l'emprise de la couche
 * @param {number} id 
 */
function extentCouche(id) {
    fetchSess(data => {
        let sess = data.filter;
        sess.forEach(element => {
            if (element.id == id) {
                fitToextent(element.valeur)
            }
        });
    });
}


function clickSidebar() {
    $('#sidebarmenu').click();


}

/**
 * Change la visibilité d'une couche
 * @param {number} id 
 */
function switchLayerVisibility(id, fa, precede) {
    fetchSess(data => {
        let sess = data.filter;
        sess.forEach(element => {
            if (element.id == id) {
                let name = precede + '' + element.valeur;

                let vectLayer = getLayer(name);
                if (vectLayer.getVisible() == true) {
                    vectLayer.setVisible(false);
                    $("#" + fa + '' + id).removeClass('fa-eye').addClass('fa-eye-slash');

                } else {
                    vectLayer.setVisible(true);
                    $("#" + fa + '' + id).removeClass('fa-eye-slash').addClass('fa-eye');
                }
            }
        });
    });
}



/**
 * Fonction qui permet de déclarer la liste des couches et les rendres triable (modification ordre)
 */
function list() {
    $("#couches").sortable({
        connectWith: ".connectList",
        update: function (event, ui) {
            let couches = $("#couches").sortable("toArray");
            tabid = makeID(couches);
            fetchSess(dat => {
                let t = findPostion(tabid, dat.filter);
                positionLayers(t);
                //debut partie session
                let filter = dat.filter;
                let tab = new Array(filter.length);
                filter.forEach(element => {
                    for (let k = 0; k < t.length; k++) {
                        if (element.id == t[k].id) {
                            tab[t[k].position] = element;
                        }
                    }
                });
                //updateSess(tab); TRAVAILLER A CE NIVEAU POUR LA BD
            });

        }
    }).disableSelection();
}




function makeID(tableauID) {
    let tab = [];
    tableauID.forEach(element => {
        tab.push(parseInt(element.substr(1)));
    });
    return tab.reverse(); //renverse l'ordre le premier devient le dernier 
}

function findPostion(tabid, sess) {
    let tableauuuu = [];
    sess.forEach(lay => {
        for (let k = 0; k < tabid.length; k++) {
            if (tabid[k] == parseInt(lay.id)) {
                tableauuuu.push({
                    "nom": lay.valeur,
                    "position": k,
                    "id": lay.id
                });
            }
        }
    });
    return tableauuuu;
}
function positionLayers(ta) {
    for (let k = 0; k < ta.length; k++) {
        let cou = getLayer(ta[k].nom);
        cou.setZIndex(ta[k].position);
        map.updateSize();
    }
}

/**
 * Fonction qui au clique affiche un modal contenant les infos sur l'aire
 */
function modalInfo(aire_geo) {

    let modal =
        '<div class="modal inmodal fade" id="myModal6" tabindex="-1" role="dialog"  aria-hidden="true">' +
        '<div class="modal-dialog modal-sm">' +
        ' <div class="modal-content">' +
        ' <div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +
        '<h4 class="modal-title">Aire Géographique</h4>' +
        ' </div>' +
        '<div class="modal-body">' +
        '<ul>' +
        '<li><strong>Nom: </strong> ' + aire_geo.aire_geo.denomination + ' </li>' +
        '<li><a href="' + aire_geo.aire_geo.url_fiche + '" target="_blank">fiche <i class="fa fa-1x fa-link"></i></a> </li>' +
        '<li><a href="' + aire_geo.aire_geo.url_cdc + '" target="_blank"> cahier des charges<i class="fa fa-1x fa-link"></i></a></li>' +
        '</ul>' +
        '</div>' +
        '<div class="modal-footer">' +

        '<button type="button" class="btn btn-primary">Fermer</button>' +
        '</div>' +
        ' </div>' +
        '</div>' +
        '</div>';

    return modal;

}


/**Pour la recherche avancée */
function advanceForm() {
    const formulaire =
        '<form onsubmit="return false;" class="form-horizontal" name="advanceForm" id="parcelle" >' +
        '<div class="form-group">' +
        ' <label class="col-sm-3">Commune:</label>' +
        '<div class="col-sm-9">' +
        '<input class="form-control typeahead" placeholder="commune" type="text" id="communeS" autocomplete="off">' +
        '</div>' +
        '</div>' +
        '<div class="form-group" >' +
        '<div class="col-sm-12 alert alert-success" style="display:none" id="alertCommune">' +
        '<h4>Commune :' +
        '<span  id="communecherche" ></span>' +
        '</h4>' +
        '</div>' +
        '<div class="row" style="display:none" id="paramParcelle">' +
        '<div class="col-sm-5" id="parcellerInput">' +
        '<input class="form-control rondeur " id="Parsection" placeholder="Section" type="text" >' +
        '</div>' +
        '<div class="col-sm-5">' +
        '<input class="form-control rondeur " id="numpar" placeholder="numParcelle" type="text" >' +
        '</div>' +
        '<div class="">' +
        '<input class="form-control rondeur " id="sectionID" placeholder="numParcelle" type="text" style="display:none;" >' +
        '</div>' +
        '<div class="col-sm-2">' +
        '<button class="btn-primary btn btn-sm btn-rounded " id="parcelleSearcher"placeholder="commune" type="text" >OK' +
        '</button>' +
        '</div>' +
        '<div class="col-sm-12 " id="erreurParcelle" style="display:none">' +
        '<br><h5 class="text-danger"  >[Erreur] Remplir au moins l\'un des champs!!!</h5>' +
        '</div>' +
        '</div>' +
        '</div>'
    '</form>';

    return formulaire;
}



/**
 * Affiche le formulaire en fonction de l'élément choisi
 * @param {String} option 
 */
function formLoader(option) {
    $("#formloader").empty();
    $("#resultat").hide();
    if (option == "commune" || option == "parcelle") {
        $("#formloader").append(advanceForm() + '');
    }

}

/**
 *Effectue la recherche soit pour les communes, soit pour les parcelles
 * @param {String} option 
 * @param {JSON} item 
 */
function Resarch(option, item) {
    if (option == "commune") {

        resetCommuneForm();
        let pieces = item.split(/[\s-]+/);
        let number = String(pieces[0]);
        $("#alertCommune").show();
        $("#communecherche").append(item);
        makeCommune(number);
    }
    if (option == "parcelle") {
        resetParcelleForm();
        setSection(item);
        searchParcelle(item);
    }
}

/**
 * Efface tous les champs pour recommencer la recherche
 */
function resetCommuneForm() {
    $(".resultPar").empty();
    $(".resultPar").hide();
    $("#paramParcelle").hide();
    $("#alertCommune").hide();
    $("#communecherche").empty();
    $("#parcellerInput").hide();
    //suites
}

/**
 * efface tous les champs pour recommencer la recherche sur les parcelles
 */
function resetParcelleForm() {
    $("#paramParcelle").show();
    $("#communecherche").empty();
    $("#resultatable").empty();
    $("#resultatable").hide();
    $("#Parsection").val('');
    $("#numpar").val('');
    $("#resultat").hide();
}


/**
 * Initialize la section
 * @param {Object} item 
 */
function setSection(item) {
    let pieces = item.split(/[\s-]+/);
    let number = String(pieces[0]);
    $("#alertCommune").show();
    $("#communecherche").append(item);
    $("#sectionID").val(number);
  
}

/**
 * reinitialise les champs resultats
 */
function resetParcelleSearch() {
    $("#resultatable").empty();
    $("#resultatable").show();
    $("#resultat").show();
    $("#alertCommune").show();
}

/**
 * Affiche ou non le message d'erreur pour qu'un champ soit rempli
 */
function errorParcelleSearch(option) {
    if (option == "yes") {
        $("#paramParcelle").addClass('has-error');
        $("#erreurParcelle").show();
    } else {
        $("#erreurParcelle").hide();
        $("#paramParcelle").removeClass('has-error');
    }

}


function appendParcelle(parcelle) {
    $("#resultatable").append(
        '<tr class="resultPar">' +
        '<td><a href="#" onclick="loadParcelle(' + parcelle.id + ')">' + parcelle.idu + '</a></td>' +
        '<td> [' + parcelle.insee + '] ' + parcelle.commune + '</td>' +
        '</tr>'
    );
}

/**
 * gère la recherche sur les parcelles
 */
function searchParcelle() {
    $("#parcelleSearcher").on('click', () => {
        if (!$("#Parsection").val() && !$("#numpar").val()) {
            errorParcelleSearch("yes");
        }
        else {
            errorParcelleSearch("no");
            AjaxParcelle();
        }

    });

}

/**
 * 
 * @param {*} data 
 * @param {*} type 
 */
function SearchRow(data, type) {
        let element = returnElement(data,type);
        let str = type.substring(0,3);
        let fa = 'fa'+str;
    $("#couches").prepend(
        '<li class="warning-element" id="c' + element.id + '">' +
        '<h3 class="text-center">' + type + ': ' + element.valeur +
        '</h3>' +

        '<div class="agile-detail">' +
        ' <a  href="#" class=" btn btn-xs btn-white" onclick="switchLayerVisibility2(\'' + element.id + '\',\''+fa+'\',\''+str+'\')">' +
        ' <i id="fa'+str + element.id + '" class="fa fa-1x fa-eye"></i>' +
        ' </a>' +
        ' <a href="#" id="c'+str + data.id + '" class="painter btn btn-xs btn-success" >' +
        ' <i class="fa fa-1x fa-paint-brush"></i>' +
        ' </a>' +
        ' <a href="#" class="pull-right btn btn-xs   btn-danger" onclick="deleteLayerRow2(\'' + element.id + '\')">' +
        ' <i class="fa fa-1x fa-trash"></i>' +
        ' </a>' +
        ' <a href="#"  class=" btn btn-xs btn-primary" onclick="extentCouche(\'' + element.id + '\')">' +
        ' <i class="fa fa-1x fa-map-marker"></i>' +
        ' </a>' +
        '</div>' +
        ' </li>'
    );
  
}

function returnElement(data,type){
    if(type == "parcelle"){
        return {
            id : data.id,
            valeur: data.idu
        };
    }
    if(type == "commune"){
        return {
            id: data.code_insee,
            valeur: data.nom_com
        };
    }

}

function switchLayerVisibility2(id, fa, precede) {
    fetchSess(data => {
        let sess = data.filter;
        sess.forEach(element => {
            if (element.id == id) {
                let name = precede + '' + element.id;

                let vectLayer = getLayer(name);
                if (vectLayer.getVisible() == true) {
                    vectLayer.setVisible(false);
                    $("#" + fa + '' + id).removeClass('fa-eye').addClass('fa-eye-slash');

                } else {
                    vectLayer.setVisible(true);
                    $("#" + fa + '' + id).removeClass('fa-eye-slash').addClass('fa-eye');
                }
            }
        });
    });
}

function LayerVisibilitySwitcher(id, fa,precede){
   
}
