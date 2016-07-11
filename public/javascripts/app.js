

var currentWebsite = window.location.href;
//alert(currentWebsite);

var websiteAddress = "http://localhost:8080";

var vectorURL = websiteAddress.concat("/api/vectors/");
var transcriptionURL = websiteAddress.concat("/api/transcriptions/");
var translationURL = websiteAddress.concat("/api/translations/");

//info.json format URL
var imageSelected;
var imageSelectedFormats;
var imageSelectedMetadata = [];

//API URL
var vectorSelected = "";
var currentCoords;
//booleans to declare if it has one or not
var vectorTranscription;
var vectorTranslation;

//API URL
var textSelected = "";
//API URL
var textSelectedParent = "";
//DOM id
var textSelectedID;
//parent API URL + ID
var textSelectedHash;
//HTML Selection Object
var textSelectedFragment = "";
var textSelectedFragmentString = "";
var textTypeSelected = "";

//URL
var targetSelected;
var targetType = ""; 

//those targets currently open in editors
var editorsOpen = [];

//Boolean to indicate if the currently selected text already has children or not
var childrenText = false;
//used to indicate if the user is currently searching for a vector to link or not
var selectingVector = "";

var findingcookies = document.cookie;

///// TEXT SELECTION

var outerElementTextIDstring;
var newContent;
var newNodeInsertID;
var startParentID;

//based on the code from https://davidwalsh.name/text-selection-ajax
// attempt to find a text selection 
function getSelected() {
  if(window.getSelection) { return window.getSelection() }
  else if(document.getSelection) { return document.getSelection(); }
  else {
    var selection = document.selection && document.selection.createRange();
    if(selection.text) { return selection.text; }
    return false;
  }
  return false;
};

// create sniffer 
$(document).ready(function() {
  $('#page_body').on("mouseup", '.content-area', function(event) {

    selection = getSelected(); 
    textSelectedFragment = selection;

    if(textSelectedFragment && (textSelectedFragment = new String(textSelectedFragment).replace(/^\s+|\s+$/g,''))) {
      textSelectedFragmentString = textSelectedFragment.toString();
    };

    var startNode = selection.anchorNode; // the text type Node that the beginning of the selection was in
    var startNodeText = startNode.textContent; // the actual textual body of the startNode - removes all html element tags contained
    var startNodeTextEndIndex = startNodeText.toString().length;
    startParentID = startNode.parentElement.id;
    var startParentClass = startNode.parentElement.className;

    var nodeLocationStart = selection.anchorOffset; //index from within startNode text where selection starts
    var nodeLocationEnd = selection.focusOffset; //index from within endNode text where selection ends

    var endNode = selection.focusNode; //the text type Node that end of the selection was in 
    var endNodeText = endNode.textContent;
    var endParentID = endNode.parentElement.id; //the ID of the element type Node that the text ends in

    outerElementTextIDstring = "#" + startParentID; //will be encoded URI of API?

    //only checking here so that other info can still be accessed from reopening
    if (startParentClass.includes('openTranscriptionChildrenPopup')) { 
      $("#popupTranscriptionChildrenMenu").popup("open");
    }
    else if (startParentClass.includes('openTranslationChildrenPopup')) { 
      $("#popupTranslationChildrenMenu").popup("open");
    }
    else if (startParentID != endParentID) {
      alert("you can't select across existing fragments' borders sorry");
    }
    else {

      var newSpanClass;
      var newPopupMenu;
      if (startParentClass.includes('transcription-text')) {
        newSpanClass = "transcription-text openTranscriptionChildrenPopup";
        newPopupMenu = "#popupTranscriptionNewMenu";
      }
      else if (startParentClass.includes('translation-text')) {
        newSpanClass = "translation-text openTranslationChildrenPopup";
        newPopupMenu = "#popupTranslationNewMenu";
      }
      else {
        alert("Please select transcription translation text");
      };

      var newIDnumber = Math.random().toString().substring(2);
      newNodeInsertID = startParentID.concat("-location-"+newIDnumber); //not a standardised selection label but will do for now

      var newSpan = "<a class='" + newSpanClass + "' id='" + newNodeInsertID + "' >" + textSelectedFragment + "</a>";
   
      var outerElementHTML = $(outerElementTextIDstring).html().toString(); //includes any spans that are contained within this selection 

      ///CONTENT BEFORE HIGHLIGHT IN THE TEXT TYPE NODE
      var previousSpanContent = startNodeText.slice(0, nodeLocationStart);

      //CONTENT BEFORE HIGHLIGHT IN THE ELEMENT TYPE NODE
      var previousSpan = startNode.previousElementSibling; //returns null if none i.e. this text node is first node in element node
      var outerElementStartContent;
      if (previousSpan == "null" || previousSpan == null) {outerElementStartContent = previousSpanContent}
      else {
        var previousSpanAll = previousSpan.outerHTML;
        var StartIndex = outerElementHTML.indexOf(previousSpanAll) + previousSpanAll.length;
        outerElementStartContent = outerElementHTML.slice(0, StartIndex).concat(previousSpanContent);
      };

      ///CONTENT AFTER HIGHLIGHT IN THE TEXT TYPE NODE
      var nextSpanContent;
      if (endNode == startNode) { nextSpanContent = startNodeText.slice(nodeLocationEnd, startNodeTextEndIndex)}
      else {nextSpanContent = endNodeText.slice(0, nodeLocationEnd)};

      ///CONTENT AFTER HIGHLIGHT IN ELEMENT TYPE NODE
      var nextSpan = endNode.nextElementSibling; //returns null if none i.e. this text node is the last in the element node
      var outerElementEndContent;
      if (nextSpan == "null" || nextSpan == null) {outerElementEndContent = nextSpanContent}
      else {
        var nextSpanAll = nextSpan.outerHTML;
        var EndIndex = outerElementHTML.indexOf(nextSpanAll);
        outerElementEndContent = nextSpanContent.concat(outerElementHTML.substring(EndIndex));
      };

      newContent = outerElementStartContent + newSpan + outerElementEndContent;
      $( newPopupMenu ).popup( "open");

    };

  });
});

var insertSpanDivs = function() {
  $(outerElementTextIDstring).html(newContent); 
  textSelectedID = newNodeInsertID;
};

var newTranscriptionFragment = function() {

  textSelectedHash = textSelectedParent.concat(".body.text#"+textSelectedID); //need to refer specifically to body text of that transcription - make body independent soon so no need for the ridiculously long values??
  targetSelected = [textSelectedHash];
  var targetData = {body: {text: textSelectedFragmentString, format: "text/html"}, target: {id: textSelectedHash, format: "text/html"}, parent: textSelectedParent};
  
  $.ajax({
    type: "POST",
    url: transcriptionURL,
    async: false,
    data: targetData,
    success: 
      function (data) {
        textSelected = data.url;
      }
  });

  var newHTML = $(outerElementTextIDstring).html();
  var parentData = {body: {text: newHTML}, children: {id: textSelectedID, fragments: {id: textSelected}}};

  $.ajax({
    type: "PUT",
    url: textSelectedParent,
    async: false,
    dataType: "json",
    data: parentData,
    success:
      function (data) {}
  });

};

var findClassID = function(classString, IDstring) {
  var IDindex = classString.search(IDstring) + IDstring.length;
  var IDstart = classString.substring(IDindex);
  var theID = IDstart.split(" ", 1);
  return theID[0];
};

///// API FUNCTIONS

var getTargetJSON = function(target) {

  var targetJSON;

  $.ajax({
  type: "GET",
  dataType: "json",
  url: target,
  async: false,
  success: 
    function (data) {
      targetJSON = data;
    }
  });

  return targetJSON;
};

var searchCookie = function(field) {

  var searchTerm = field;
  var fieldIndex = findingcookies.lastIndexOf(searchTerm);
  if (fieldIndex == -1) {
    return false;
  }
  else {
    var postField = findingcookies.substring(fieldIndex+searchTerm.length);
    var theValueEncoded = postField.split(";", 1);
    var theValue = theValueEncoded[0];
    return theValue;
  };
};

var checkForVectorTarget = function(theText) {
  var isThere = "false";
  alert(theText);
  var theChecking = getTargetJSON(theText);
  var theTargets = theChecking.target;
  theTargets.forEach(function(target){
    if(target.format == "SVG"){
      isThere = target.id;
    };
  });
  return isThere;
};

var checkForAnnotation = function(target, textType) {

  var targetChecking = getTargetJSON(target);
  var targetAnno;
  if (textType == "transcription") {
    targetAnno = targetChecking.transcription;
  }
  else if (textType == "translation") {
    targetAnno = targetChecking.translation;
  };

  if (targetAnno == '""') {  return false  }
  else if (targetAnno == "") {  return false  }
  else {  return targetAnno  };

};

var checkForParent = function(target) {

  alert(target);

  var targetChecking = getTargetJSON(target);
  var parent = targetChecking.parent;

  if (parent == '""') { return false }
  else if (parent == "") {  return false }
  else if (parent == false) {  return false }
  else {  return parent   };

};

var lookupTranscriptionChildren = function(target) {

  var childTexts
  var targetParam = encodeURIComponent(target);
  var aSearch = transcriptionURL.concat("targets/"+targetParam);
  $.ajax({
    type: "GET",
    dataType: "json",
    url: aSearch,
    async: false,
    success: 
      function (data) {
        childTexts = data.list;
      }
  });
  return childTexts;

};

var updateVectorSelection = function(vectorURL) {

  var textData = {target: {id: vectorURL, format: "SVG"}};
  var vectorData;
  if (textTypeSelected == "transcription") {  vectorData = {transcription: textSelected};  }
  else if (textTypeSelected == "translation") {  vectorData = {translation: textSelected};  };

  $.ajax({
    type: "PUT",
    dataType: "json",
    url: textSelected,
    async: false,
    data: textData,
    success: 
      function (data) {}
  });

  $.ajax({
    type: "PUT",
    dataType: "json",
    url: vectorURL,
    async: false,
    data: vectorData,
    success: 
      function (data) {
        selectingVector = "";
      }
  }); 

};

var votingFunction = function(vote, votedID, currentTopText) {

  var theVote;
  var targetID; ///API URL of the annotation voted on
  var outerSpan;
  if (targetType == "transcription"){
    theVote = transcriptionURL + "voting/" + vote;
    targetID = transcriptionURL.concat(votedID);
    outerSpanOpen = "<a class='transcription-text openTranscriptionChildrenPopup' id='"+ textSelectedID + "' >";
  } 
  else if (targetType == "translation"){
    theVote = translationURL + "voting/" + vote;
    targetID = translationURL.concat(votedID);
    outerSpanOpen = "<a class='translation-text openTranslationChildrenPopup' id='"+ textSelectedID + "' >";
  };
  var idString = "#" + textSelectedID;

  var votedTextBody = $(votedID).html(); 
  var currentText = outerSpanOpen + currentTopText + "</a>"; ///current most voted at that location, includes outerHTML
  var votedText = outerSpanOpen + votedTextBody + "</a>"; ///text just voted on, includes outerHTML

  var targetData = {
    parent: textSelectedParent, ///it is this that is updated containing the votedText within its body
    children: {
      id: idString, //ID of span location
      fragments: {
        id: targetID,
      }
    },
    votedText: votedText,
    topText: topText
  };

  $.ajax({
    type: "PUT",
    url: theVote,
    async: false,
    dataType: "json",
    data: targetData,
    success:
      function (data) {}
  });

};

var buildCarousel = function(childrenArray, baseURL, popupIDstring, canItLink) {

  var existingChildren = childrenArray; //an array of all the children JSONs
  if (typeof existingChildren != false || existingChildren != 'undefined' || existingChildren != null) {
    var openingHTML = "<div class='item pTextDisplayItem'><div class='pTextDisplay'><div><blockquote id='";

    var middleHTML = "' class='content-area'>";

    var endTextHTML = "</blockquote><br>";
    var voteButtonsHTML = "<button type='button' class='btn voteBtn votingUpButton'>+1</button><button type='button' class='btn voteBtn votingDownButton'>-1</button><br>";
    var linkButtonHTML = "<button type='button' class='btn linkBtn'>Link Vector</button><br>";

/////////need to add metadata options!!!
    var metadataHTML = " ";

    var endDivHTML = "</div></div></div>";
    if (canItLink == false){linkButtonHTML = " "};
    var closingHTML = endTextHTML + voteButtonsHTML + linkButtonHTML + metadataHTML + endDivHTML;

    existingChildren.forEach(function(text) {
      var itemText = text.body.text;
      var theURL = text.body.id;
      var itemID = theURL.slice(baseURL.length, theURL.length);
      var itemHTML = openingHTML + itemID + middleHTML + itemText + closingHTML;
      $(popupIDstring).find(".transcriptionCarouselWrapper").append(itemHTML);
/////////update metadata options with defaults and placeholders???    

    });
  };

};

var findHghestRankingChild = function(parent, locationID) {
  var parentJSON = getTargetJSON(parent);
  var theChild = "";
  var locationArray = parentJSON.target.forEach(function(location){
    if (location.id == locationID) {
      location.fragments.forEach(function(alternative){
        if (alternative.rank == 0) {
          theChild = alternative.id;
        };
      });
    };
  });
  return theChild;
};

////IMAGE HANDLING

var loadImage = function() {

  imageSelected = searchCookie("imageviewing=");
  var theImage = getTargetJSON(imageSelected);
  imageSelectedFormats = theImage.formats;
  imageSelectedMetadata = theImage.metadata;

};

var getImageVectors = function(target) {
  var imageVectors;
  var targetParam = encodeURIComponent(target);
  var imageSearch = vectorURL.concat("targets/"+targetParam);
  $.ajax({
    type: "GET",
    dataType: "json",
    url: imageSearch,
    async: false,
    success: 
      function (data) {
        imageVectors = data.list;
      }
  });
  return imageVectors;
};

///// VIEWER WINDOWS

var openEditorMenu = function() {

  //GLOBAL VARIABLES USED
  var canUserAdd;
  var canUserVote;
  var canUserLink = true;
  var childrenArray;
  var baseURL;
  var wrapperClassList;
  if (textTypeSelected == "transcription") {
    wrapperClassList = "transcription-text ";
    childrenArray = lookupTranscriptionChildren(targetSelected[0]);
    baseURL = transcriptionURL;
  }
  else if (textTypeSelected == "translation") {
    wrapperClassList = "translation-text ";
    childrenArray = lookupTranslationChildren(targetSelected[0]);
    baseURL = translationURL;
  };

  //CREATE POPUP BOX
  var popupBoxDiv = document.createElement("div");
  popupBoxDiv.classList.add("textEditorPopup");
  popupBoxDiv.id = "DivTarget-" + Math.random().toString().substring(2);
  var popupIDstring = "#" + popupBoxDiv.id;
  var popupTranscriptionTemplate = document.getElementById("theEditor");
  var newPopupClone = popupTranscriptionTemplate.cloneNode("true");
  popupBoxDiv.appendChild(newPopupClone);
//need to develop function to decide initial location of new div node
//hardcoded just for dev
  var pageBody = document.getElementById("ViewerBox1");
  pageBody.appendChild(popupBoxDiv); 

  var newCarouselID = "Carousel" + Math.random().toString().substring(2);
  $(popupIDstring).find(".editorCarousel").attr("id", newCarouselID);
  $(popupIDstring).find(".carousel-control").attr("href", "#" + newCarouselID);

  //the most popular text HTML ID
  var theText = textSelected.slice(baseURL.length, textSelected.length);

  //ADD CAROUSEL 
  if (targetType.includes("vector") == true){
    canUserLink = false;
    if (((textTypeSelected == "transcription")&&(vectorTranscription == false)) || ((textTypeSelected == "translation")&&(vectorTranslation == false))) {
      var displayText = " [[[[NOTHING EXISTS HERE YET]]]] "; 
      theText = "NothingToDisplay"; 
      var placeholderURL = baseURL.concat(theText);
      childrenArray = [{body: {id: placeholderURL, text: displayText}}];
      canUserAdd = true;
      canUserVote = false;
    };
  };

  if (targetType.includes(textTypeSelected) == true){
    //if the text has a parent then you can vote between and add because it will also have a text target
    if (checkForParent(textSelected) == false) { 
          canUserAdd = true; 
          canUserVote = true; 
    }
    //if it doesn't have a parent then it shouldn't have any siblings, only children
    else { 
          canUserAdd = false; 
          canUserVote = false; 
    };
  };

  buildCarousel(childrenArray, baseURL, popupIDstring, canUserLink); ///not working????
  $(popupIDstring).find(".editorCarouselWrapper").find('*').addClass(wrapperClassList); 
  var theTextString = "#"+theText;

  //emphasise theText as the current highest voted -- choose better styling later
  $(theTextString).css("color", "grey");
  $(theTextString).parent().parent().append("<h4>Most Popular</h4>");
  $(theTextString).parent().parent().parent().addClass("active"); //ensures it is the first slide people see
  $(theTextString).addClass("currentTop");

  if (canUserAdd == false) {
    //disable the add new slide
  };
  if (canUserVote == false) {
    $(theTextString).siblings(".voteBtn").remove();
  };

  $(".textEditorPopup").draggable();
  $(".textEditorPopup").draggable({
    handle: ".popupBoxHandlebar"
  });

  editorsOpen.push({
    "editor": popupIDstring,
    "typesFor": targetType,
    "vectorSelected": vectorSelected,
    "textSelectedParent": textSelectedParent,
    "textSelectedID": textSelectedID,
    "textSelectedHash": textSelectedHash,
    "textTypeSelected": textTypeSelected
  });

};

var closeEditorMenu = function(thisEditor) {
  var theParent = document.getElementById("ViewerBox1");
  var toRemove = document.getElementById(thisEditor);
  theParent.removeChild(toRemove);
};

var addAnnotation = function(thisEditor){

  var editorString = "#" + thisEditor;
  var newText = $(editorString).find(".newAnnotation").val();
  var createdText;
  var baseURL;
  var textData = {body: {text: newText, format: "text"}, target: []};
  var targetData;

  if (targetType.includes("vector") == true) {
    textData.target.push({id: vectorSelected, format: "image/SVG"});
  };

  if (textTypeSelected == "transcription") {
    baseURL = transcriptionURL;
    if (targetType.includes("transcription") == true) {
      textData.target.push({id: textSelectedHash, format: "text/html"});
      textData.parent = textSelectedParent;
    };
    if (targetType.includes("translation") == true) {
      //textData.target.push({id: ???, format: "text/html"});
    };
  };

  if (textTypeSelected == "translation") {
    baseURL = translationURL;
    if (targetType.includes("translation") == true) {
      textData.target.push({id: textSelectedHash, format: "text/html"});
      textData.parent = textSelectedParent;
    };
    if (targetType.includes("transcription") == true) {
      //textData.target.push({id: ???, format: "text/html"});
    };
  };

  $.ajax({
    type: "POST",
    url: baseURL,
    async: false,
    data: textData,
    success: 
      function (data) {
        createdText = data.url;
      }
  });

  $(editorString).find(".newAnnotation").val(""); //reset
  newText = "";

  if ((targetType.includes("transcription")==true)&&(textTypeSelected == "transcription")) {
    targetData = {children: {id: textSelectedID, fragments: {id: createdText}}};
    $.ajax({
      type: "PUT",
      url: textSelectedParent,
      async: false,
      data: targetData,
      success:
        function (data) {}
    });
  }; 
  if ((targetType.includes("translation")==true)&&(textTypeSelected == "translation")) {
    targetData = {children: {id: textSelectedID, fragments: {id: createdText}}};
    $.ajax({
      type: "PUT",
      url: textSelectedParent,
      async: false,
      data: targetData,
      success:
        function (data) {}
    });
  }; 

  closeEditorMenu(thisEditor);
  openEditorMenu();

};

var setVectorVariables = function(textType) {
  var textType = textType;
  targetSelected = [vectorSelected];
  targetType = "vector";
  var openNewEditor = function() {
    var targetText = checkForAnnotation(vectorSelected, textType); //return the api url NOT json file
    if (targetText == false || targetText == 'undefined' || targetText == null){ 
      if (textType == "transcription") {  vectorTranscription = false;  } 
      else if (textType == "translation") {  vectorTranslation = false;  };  
    }
    else { 
      if (textType == "transcription") {  vectorTranscription = true;  } 
      else if (textType == "translation") {  vectorTranslation = true;  }; 
      textSelected = targetText;
      textTypeSelected = textType;
      var lookupTarget = getTargetJSON(textSelected);
      textSelectedFragment = lookupTarget.body.text;
      textSelectedFragmentString = textSelectedFragment;
      textSelectedHash = "";
      textSelectedID = "";
      textSelectedParent = lookupTarget.parent; 
      if (textSelectedParent == "''" || textSelectedParent == "" || textSelectedParent == false || textSelectedParent == null || textSelectedParent == "undefined") {}
      else {
        lookupTarget.target.forEach(function(target){
          if(target.format == "text/html"){
            textSelectedHash = target.id;
            var preHash = textSelectedParent.concat(".body.text#");
            textSelectedID = textSelectedHash.substring(preHash.length);
          };
        });
        targetSelected = [vectorSelected, textSelectedParent];
        targetType = "vector "+textType;
      };
    };
    openEditorMenu();
  };

  if (editorsOpen == null || editorsOpen == 'undefined') {  openNewEditor();  }
  else {
    var canOpen = true;
    editorsOpen.forEach(function(editorOpen){
      if ((editorOpen.vectorSelected == vectorSelected) && (editorOpen.textTypeSelected == textType)){
        $(editorOpen.editor).effect("shake");
        canOpen = false;
      }
    });
    if (canOpen == true) {  openNewEditor() };
  };

};

var setTextVariables = function(textType) {
  var baseURL;
  if (textType == "transcription") {
    baseURL = transcriptionURL;
  }
  else if (textType == "translation") {
    baseURL = translationURL;
  }
  textSelectedID = startParentID;
  textSelectedFragment = $(outerElementTextIDstring).html();
  textSelectedFragmentString = $(outerElementTextIDstring).html().toString(); //remove html tags
  textSelectedParent = baseURL + $(outerElementTextIDstring).parent().attr('id'); 
  textSelectedHash = textSelectedParent.concat(".body.text"+textSelectedID);
  textTypeSelected = textType;

  var openNewEditor = function() {
    textSelected = findHghestRankingChild(textSelectedParent, textSelectedID);
    checkVectors = checkForVectorTarget(textSelected); 
    if (checkVectors != "false"){
      vectorSelected = checkVectors;
      targetSelected = [textSelectedHash, vectorSelected];
      targetType = " vector " + textType;
    }
    else {
      vectorSelected = "";
      targetSelected = [textSelectedHash];
      targetType = textType;
    };
    openEditorMenu();
  };

  if (editorsOpen == null || editorsOpen == 'undefined') {  openNewEditor();  }
  else {
    var canOpen = true;
    editorsOpen.forEach(function(targetOpen){
      if ((targetOpen.textSelectedParent == textSelectedParent) && (targetOpen.textType == textType)) {
        $(targetOpen.editor).effect("shake"); 
        canOpen = false; 
      };
    });
    if (canOpen == true) {
      openNewEditor();
    };
  };
};

///////LEAFLET 

loadImage(findingcookies);
var map;
var baseLayer;
var allDrawnItems = new L.FeatureGroup();
var controlOptions = {
    draw: {
//disables the polyline and marker feature as this is unnecessary for annotation of text as it cannot enclose it
        polyline: false,
        marker: false,
//disabling polygons and circles as IIIF image region API does not specify how to encode anything but rectangular regions
        polygon: false,
        circle: false
    },
//passes draw controlOptions to the FeatureGroup of editable layers
    edit: {
        featureGroup: allDrawnItems,
    }
};
var popupVectorMenu = L.popup()
    .setContent('<a class="openTranscriptionMenu ui-btn ui-corner-all ui-shadow ui-btn-inline">TRANSCRIPTION</a><br><a class="openTranslationMenu ui-btn ui-corner-all ui-shadow ui-btn-inline">TRANSLATION</a>');
//to track when editing
var currentlyEditing = false;
var currentlyDeleting = false;
var existingVectors = getImageVectors(imageSelected);

map = L.map('map');
map.options.crs = L.CRS.Simple;
map.setView(
  [0, 0], //centre coordinates
  0 //zoom needs to vary according to size of object in viewer but whatever
);
map.options.crs = L.CRS.Simple;
baseLayer = L.tileLayer.iiif(imageSelected);
map.addLayer(baseLayer);
map.addLayer(allDrawnItems);
new L.Control.Draw(controlOptions).addTo(map);

map.whenReady(function(){
  mapset = true;
});

//load the existing vectors
if (existingVectors != false) {
  existingVectors.forEach(function(vector) {

    var oldData = {
        "type": "Feature",
        "properties":{},
        "geometry":{
          "type": vector.notFeature.notGeometry.notType,
          "coordinates": [vector.notFeature.notGeometry.notCoordinates]
        }
      };

    var existingVectorFeature = L.geoJson(oldData, {
      onEachFeature: function (feature, layer) {
        layer._leaflet_id = vector.body.id,
        allDrawnItems.addLayer(layer),
        layer.bindPopup(popupVectorMenu)
      }

    }).addTo(map);

  });
};


////whenever a new vector is created within the app
map.on('draw:created', function(evt) {

	var layer = evt.layer;
  var shape = layer.toGeoJSON();

	allDrawnItems.addLayer(layer);

//check for parents of created vector and if so then add to targetData

  var targetData = {geometry: shape.geometry, target: {id: imageSelected, formats: imageSelectedFormats}, metadata: imageSelectedMetadata};

  $.ajax({
    type: "POST",
    url: vectorURL,
    async: false,
    data: targetData,
    success: 
      function (data) {
        vectorSelected = data.url;
        targetSelected = [data.url];
        targetType = "vector";
      }
  });

  layer._leaflet_id = vectorSelected;
  layer.bindPopup(popupVectorMenu).openPopup();

    if (selectingVector != "") {
      updateVectorSelection(vectorSelected);
    }

});

/////whenever a vector is clicked
allDrawnItems.on('click', function(vec) {

  vectorSelected = vec.layer._leaflet_id;

  if ((currentlyEditing == true) || (currentlyDeleting == true)) {}

  else {

    if (selectingVector == "") {
      vec.layer.openPopup();
    }
    else {
      updateVectorSelection(vectorSelected);
    }
  };

});

map.on('draw:deletestart', function(){
  currentlyDeleting = true;
});
map.on('draw:deletestop', function(){
  currentlyDeleting = false;
});
map.on('draw:editstart', function(){
  currentlyEditing = true;
});
map.on('draw:editstop', function(){
  currentlyEditing = false;
});

//////update DB whenever vector coordinates are changed
allDrawnItems.on('edit', function(vec){

  var shape = vec.layer.toGeoJSON();

  $.ajax({
    type: "PUT",
    url: vectorSelected,
    async: false,
    data: shape,
    success:
      function (data) {}
  });

});

//////update DB whenever vector is deleted
allDrawnItems.on('remove', function(vec){

  $.ajax({
    type: "DELETE",
    url: vectorSelected,
    success:
      function (data) {}
  });

});

map.on('popupopen', function() {

  $('.openTranscriptionMenu').one("click", function(event) {
    alert("the open function is running");
    setVectorVariables("transcription");
    map.closePopup();
  });

  $('.openTranslationMenu').one("click", function(event) {
    setVectorVariables("translation");
    map.closePopup();
  });

});

//////TRANSCRIPTIONS

//NEW LOCATIONS
$( "#popupTranscriptionNewMenu" ).on( "popupafteropen", function(event, ui) {
    $('.openTranscriptionMenuNew').one("click", function(event) {
      insertSpanDivs();
      textSelectedParent = transcriptionURL.concat(startParentID);
      newTranscriptionFragment();
      textTypeSelected = "transcription";
      targetType = "transcription";
      openEditorMenu();
      $('#popupTranscriptionNewMenu').popup("close");    
    });
});

//EXISTING LOCATIONS
$( "#popupTranscriptionChildrenMenu" ).on( "popupafteropen", function( event, ui ) {
    $('.openTranscriptionMenuOld').one("click", function(event) {
      setTextVariables("transcription");
      $('#popupTranscriptionChildrenMenu').popup("close");
    });
});

///EVENTS IN TEXT EDITOR BOXES

$('#page_body').on("click", ".textEditorBox", function(event){
  var thisEditor = "#" + $(event.target).parent().attr("id");
  editorsOpen.forEach(function(target){
    if(target.editor == thisEditor) {
      targetType = "typesFor";
      vectorSelected = "vectorSelected";
      textSelectedParent = "textSelectedParent";
      textSelectedID = "textSelectedID";
      textSelectedHash = "textSelectedHash";
      textTypeSelected = "textTypeSelected";
    };
  })
});

$('#page_body').on("click", '.addAnnotationSubmit', function(event) {
  var thisEditor = $(event.target).parent().parent().parent().parent().parent().parent().parent().attr("id");
  addAnnotation(thisEditor);
});

$('#page_body').on("click", ".closePopupBtn", function(){
  var thisEditor = $(event.target).parent().parent().attr("id");
  closeEditorMenu(thisEditor);
});

/////change the textSelected to whatever slide of the carousel is selected??

$('#page_body').on("click", ".addNewBtn", function(){
  $(event.target).siblings(".editorCarousel").carousel(0);
});

$('#page_body').on("click", ".linkBtn", function(){
  updateVectorSelection();
});

$('#page_body').on("click", '.votingUpButton', function(event) {
  var votedID = $(event.target).siblings("blockquote").attr("id");
  var currentTopText = $(event.target).parent().parent().parent().siblings(".currentTop").find("blockquote").html();
  votingFunction("up", votedID, currentTopText);
});

$('#page_body').on("click", '.votingDownButton', function(event) {
  var votedID = $(event.target).siblings("blockquote").attr("id");
  var currentTopText = $(event.target).parent().parent().parent().siblings(".currentTop").find("blockquote").html();
  votingFunction("up", votedID, currentTopText);
});



