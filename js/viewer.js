//Version 1.0, 1.2.2017
//ZAAK IO Viewer
var Viewer = function(){
  'use strict';
 
  var scope = this;

  var renderer, camera, raycaster, listener;

  var preload = new THREE.LoadingManager();

  var objLoader = new THREE.ObjectLoader( preload );
  var xhrLoader = new THREE.XHRLoader( preload );

  var mouse = new THREE.Vector2(0,0);

  var tempLookAtObject = null; //temp: object we are charging up, old: object we activated
  var eventObject = null;
  var hoverObject = null;
  var resetObject = null;
  var lookAtTime = 0.0;
  var maxLookTime = 1.1;

  var prevTime, request; 
  var running = false;

  var frameDelta;

  var controls, effect;

  var events = {};
  var rayStart = {};
  var rayUpdate = {};
  var rayEnd = {};
  var rayHover = {};
  var rayHoverStart = {};

  var isMobile = mobileCheck();

  var spriteAnimators = [];

  var rayObjects = [];
  this.crossHairObjects = [];
  this.crossHairObjectsEvents = [];
  this.crossHairObj;
  var originalScale = 0.6;
  var currentCrossScale = 0.0;
  var crossModifier = { scale: 1.0 };
  scope.useCrossHair = true;

  var pendingResize = false;

  //is a project loaded
  var loaded = false;

  var transitionObject; 

  transitionObject = new THREE.Mesh();

  transitionObject = new THREE.Mesh( new THREE.SphereGeometry( 0.4, 16, 16 ), new THREE.MeshBasicMaterial({color:0x000000, opacity:1.0, transparent:true, alphaTest:0.1, side:THREE.BackSide}) );
  transitionObject.name = "transition";

  //Check if device can handle WebGL
  if ( !webglAvailable() ) {
    window.open("fallback.html","_self");
  }

  //Check Mobile
  function mobileCheck() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  }

  //Setup three.js WebGL renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0xFFFFFF);

  this._renderer = renderer;

  // Append the canvas element created by the renderer to document body element.
  document.body.appendChild(renderer.domElement);

  // Create a three.js camera.
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

  listener = new THREE.AudioListener();
  listener.name = 'Listener';
  camera.add( listener );

  // Apply VR stereo rendering to renderer.
  effect = new THREE.VREffect(renderer);
  effect.setSize(window.innerWidth, window.innerHeight);

  //Set up Raycaster
  raycaster = new THREE.Raycaster();

  // Create a three.js scene.
  this.scene = new THREE.Scene();

  //Make public stuff
  this.controls = controls;
  this.camera = camera;
  this.isMobile = isMobile;
  //Unnessecary atm
  var allPlugins = {};
 

  startViewer();

  function startViewer(){

    unlockAudio(); //IOS onlys

    // Create a VR manager helper to enter and exit VR mode.
    var params = {
      hideButton: false, // Default: false.
      isUndistorted: false, // Default: false.
      BUFFER_SCALE: 1.0
    };

    scope.manager = new WebVRManager(renderer, effect, params);

    scope.manager.on('modechange', changeCall);

  }

  // Load an Editor json File
  this.loadJSON = function(file){

    xhrLoader.crossOrigin = '';

    xhrLoader.load( file, function ( text ) {

      loaded = true;
      scope.startScene( JSON.parse(text) );

    } );
  };

  this.loadProject = function( uuid ){

    //Unload the currentProject
    if(loaded)
      scope.unloadProject();

    //Load new project
    var _url = uuid;

    scope.loadJSON(_url);

  };

  this.unloadProject = function(){

    controls.resetPose();

    scope.camera.position.set(0,0,0);
    scope.scene = null;

    document.removeEventListener( 'keydown', onDocumentKeyDown );
    document.removeEventListener( 'keyup', onDocumentKeyUp );
    document.removeEventListener( 'mousedown', onDocumentMouseDown );
    document.removeEventListener( 'mouseup', onDocumentMouseUp );
    document.removeEventListener( 'mousemove', onDocumentMouseMove );
    document.removeEventListener( 'touchstart', onDocumentTouchStart );
    document.removeEventListener( 'touchend', onDocumentTouchEnd );
    document.removeEventListener( 'touchmove', onDocumentTouchMove );

    dispatch( events.stop, arguments );

    pause();


  };

  //The whole start up sequence once we have a parsed JSON file
  this.startScene = function(json) {

    setProject(json);
    setScene(objLoader.parse( json.scene ));
    setScripts(json);

    //Fog
    if(json.project.fog !== null){

      if(json.project.fog.near !== undefined){
        
        scope.scene.fog = new THREE.Fog( json.project.fogColor, json.project.fog.near, json.project.fog.far );
      
      }else{
       
        scope.scene.fog = new THREE.FogExp2( json.project.fogColor, json.project.fog.density );
      
      }
    }

    if(json.project.shadows !== undefined){

      renderer.shadowMap.enabled = true;
    }

    if(json.project.gazeTime !== undefined){
    
      maxLookTime = json.project.gazetime;
    }

    if(json.project.crosshair !== null){

      scope.useCrossHair = json.project.crosshair;
    }

    play();

    for (var property in this.allPlugins) {
      if (this.allPlugins.hasOwnProperty(property)) {
        if (typeof scope.allPlugins[property].init === "function")
          this.allPlugins[property].init();
      }
    }
  };

  //Set project values
  //Background & Fog
  function setProject ( json ){

    //Background
    renderer.setClearColor( json.project.backgroundColor, 1 );

  }

  function setScene(_scene){

    scope.scene = _scene;

     //Add crossHair raycasting targets so it only raycasts to objects that can actually
    scope.crossHairObjects = scope.scene.children;//_scene.children;

    //Manual Add

    //Add camera once a new scene is added
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

    //If your on mobile
    if(isMobile)
      camera.rotation.set(0,90,0);

    scope.camera = camera;

    //Add AudioListener
    listener = new THREE.AudioListener();
    listener.name = 'Listener';
    scope.camera.add( listener );


    // Apply VR headset positional data to camera.
    controls = new THREE.VRControls(scope.camera);

    scope.controls = controls;

    // Apply VR stereo rendering to renderer.
    // effect = new THREE.VREffect(renderer);
    // effect.setSize(window.innerWidth, window.innerHeight);
       
    scope.crossHairObj = new THREE.Mesh( new THREE.RingGeometry( 0.02, 0.04, 16 ), new THREE.MeshBasicMaterial( {
      depthTest:false,
      depthWrite:false,
      color: 0x000000,
      opacity: 1.0,
      transparent: true
    } ) );
    scope.crossHairObj.name = "crossHair";
    scope.crossHairObj.renderOrder = 0;

    scope.camera.add(scope.crossHairObj);

    scope.scene.add(scope.camera);

    //Add transition
    transitionObject.position.copy(scope.camera.position);
    scope.scene.add( transitionObject );

  }

  //Loads all scripts from the json file into the events[]
  function setScripts(json){

    events = {
      init: [],
      start: [],
      stop: [],
      keydown: [],
      keyup: [],
      mousedown: [],
      mouseup: [],
      mousemove: [],
      touchstart: [],
      touchend: [],
      touchmove: [],
      update: [],
      rayStart: [],
      rayUpdate: [],
      rayHover: [],
      rayEnd: [],
      rayHoverStart: []
    };

    var scriptWrapParams = 'player,renderer,scene,camera,webvr,crosshair';
    var scriptWrapResultObj = {};

    //Unload all old rayObjects
    rayObjects = [];

    for ( var eventKey in events ) {

      scriptWrapParams += ',' + eventKey;
      scriptWrapResultObj[ eventKey ] = eventKey;

    }

    var scriptWrapResult = JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );

    for ( var uuid in json.scripts ) {

      var object = scope.scene.getObjectByProperty( 'uuid', uuid, true );

      rayObjects.push(object);


      if ( object === undefined ) {

        console.warn( 'APP.Player: Script without object.', uuid );
        continue;

      }

      var scripts = json.scripts[ uuid ];
      rayStart[uuid] = [];
      rayUpdate[uuid] = [];
      rayEnd[uuid] = [];
      rayHover[uuid] = [];
      rayHoverStart[uuid] = [];

      //Integrate global variables
      for ( var i = 0; i < scripts.length; i ++ ) {

        var _script = scripts[ i ];
        var functions = ( new Function( scriptWrapParams, _script.source + '\nreturn ' + scriptWrapResult + ';' ).bind( object ) )( scope, renderer, scope.scene, scope.camera, scope.manager, scope.crossHairObj );
        for ( var name in functions ) {

          if ( functions[ name ] === undefined ) continue;

          if ( events[ name ] === undefined ) {

            console.warn( 'Event type not supported (', name, ')' );
            continue;

          }

            //Add crossHair raycasting targets so it only raycasts to objects that can actually
          // scope.crossHairObjects = _scene.children;
          
          switch(functions[ name ].name){

            case "rayStart":
              scope.crossHairObjectsEvents.push( object );
              rayStart[object.uuid].push(functions[ name ].bind( object ) );
            break;

            case "rayUpdate":
              rayUpdate[object.uuid].push(functions[ name ].bind( object ) );
            break;

            case "rayEnd":
              rayEnd[object.uuid].push(functions[ name ].bind( object ) );
            break;

            case "rayHover": // pc only
              scope.crossHairObjectsEvents.push( object );
              rayHover[object.uuid].push(functions[ name ].bind( object ) );
            break;

            case "rayHoverStart": // pc only
              scope.crossHairObjectsEvents.push( object );
              rayHoverStart[object.uuid].push(functions[ name ].bind( object ) );
            break;

            default:
              events[ name ].push( functions[ name ].bind( object ) );
            break;
          }
        }
      }
    }

    dispatch( events.init, arguments );

  }

  // Kick off animation loop
  function play(){

    document.addEventListener( 'keydown', onDocumentKeyDown );
    document.addEventListener( 'keyup', onDocumentKeyUp );
    document.addEventListener( 'touchstart', onDocumentTouchStart );
    document.addEventListener( 'touchend', onDocumentTouchEnd );
    document.addEventListener( 'touchmove', onDocumentTouchMove );

    if(!isMobile){
      document.addEventListener( 'mousedown', onDocumentMouseDown );
      document.addEventListener( 'mouseup', onDocumentMouseUp );
      document.addEventListener( 'mousemove', onDocumentMouseMove );
    }

    dispatch( events.start, arguments );

    resume();

    TweenMax.to(transitionObject.material, 1.0, {opacity:0, onComplete:fadeComplete});
  }

  //After a scene is fully loaded fade the transitionObject out.
  function fadeComplete (){
    scope.scene.remove(transitionObject);
    TweenMax.to('#loader', 0.4, {opacity:0});

  };

  ///////////////////////
  //Runtime - Functions
  ///////////////////////
  function crossHairAnim(){
      
      //Set ray to forward vector from the camera
      var vector = new THREE.Vector3( 0, 0, -1 );
      vector.applyQuaternion( scope.camera.quaternion );

      raycaster.set( scope.camera.position, vector.normalize() );

      //Crosshair
      var allIntersects = raycaster.intersectObjects( scope.crossHairObjects );//scope.crossHairObjects );

        var zDistance = 100.0;

      if(allIntersects.length > 0){
        for(var i = 0; i < allIntersects.length; i++){ // -1 to exclude 

            //allIntersects[i].type !== "Sprite" &&
            if(allIntersects[i].object.type !== "Sprite" && allIntersects[i].object.name !== "crossHair" && allIntersects[i].distance > 0.2){

              zDistance = allIntersects[i].distance * 0.95;

              break;
            
          }
        }
      }
        
      var vec = new THREE.Vector3( 0,0,-zDistance );

      scope.crossHairObj.position.copy( vec );

      currentCrossScale = originalScale*zDistance * crossModifier.scale;
      scope.crossHairObj.scale.set(currentCrossScale,currentCrossScale,currentCrossScale);
  }

  function raycasting(){

    //Set ray to forward vector from the camera
    var vector = new THREE.Vector3( 0, 0, -1 );
    vector.applyQuaternion( scope.camera.quaternion );

    raycaster.set( scope.camera.position, vector.normalize() );

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects( rayObjects );

    //if nothing got hit
    if(intersects.length === 0){

      resetRaycaster();
      return;
    }  

    //Check all the intersects and give back 
    //the first visible and event bound object
    var intersectsClean = sortIntersects(intersects);

    if(intersectsClean === null){

      resetRaycaster();


    }else{

      if(hoverObject !== intersectsClean && rayHoverStart[intersectsClean.uuid]){
        TweenMax.to(crossModifier, 0.3, {scale : 1.4});
        TweenMax.to(scope.crossHairObj.material, 0.3, {opacity:0.3});

        hoverObject = intersectsClean;
        dispatch( rayHoverStart[ hoverObject.uuid ] );
      }

      //Do we look at the object we activated just before
      if(intersectsClean === eventObject)
        return;
      else{

        if(eventObject !== null){
          if(rayEnd[eventObject.uuid])  
              dispatch( rayEnd[ eventObject.uuid ] );

            eventObject = null;
        }
      }

      //V1 lookat activation
      if(tempLookAtObject === intersectsClean){

        lookAtTime += frameDelta;

        //Trigger Event on Object
        if(lookAtTime > maxLookTime){

          if(rayStart[ tempLookAtObject.uuid ]){
            dispatch( rayStart[ tempLookAtObject.uuid ] );
            eventObject = tempLookAtObject;
          }

          lookAtTime = 0.0;
          tempLookAtObject = null;

        }

      } else {

        if(tempLookAtObject !== null){
          if(rayEnd[tempLookAtObject.uuid])  
            dispatch( rayEnd[ tempLookAtObject.uuid ] );
        }

        tempLookAtObject = intersectsClean;
      }
    }
  }

  //Returns the first object hit ( excluding some special cases )
  function sortIntersects(_intersects){

    for(var y = 0; y < _intersects.length; y++){
      //Don't get crosshair and MoveToObjects
      if( !_intersects[y].object.position.equals(camera.position)){
        if(rayStart[ _intersects[y].object.uuid] ){
          return _intersects[y].object;
        }else{
          return null; 
        }  
      }
    }
    return null;
  }

  function resetRaycaster(){

    lookAtTime = 0.0;
    tempLookAtObject = null;
    resetObject = null;

    TweenMax.to(crossModifier, 0.3, {scale:1.0});
    TweenMax.to(scope.crossHairObj.material, 0.3, {opacity:1.0});

    if(eventObject !== null)
      resetObject = eventObject;
    else if(hoverObject !== null)
      resetObject = hoverObject;

    hoverObject = null;
    eventObject = null;

    if(resetObject !== null &&rayEnd[resetObject.uuid])  
      dispatch( rayEnd[ resetObject.uuid ] );
    
  }

  //gets called on manager change mode
  function changeCall(){

    if(scope.crossHairObj !== null && scope.crossHairObj !== undefined)
      scope.crossHairObj.visible = (scope.manager.mode == 3) ? true : false;

  }

  function pause(){

    running = false;

    cancelAnimationFrame( request );
  }

  function resume(){

    running = true;

    request = requestAnimationFrame( animate );
  }

  // Request animation frame loop function
  function animate( time ) {

    //Get frame delta time
    frameDelta = (time-prevTime)/1000; // formated to seconds

    //Raycaster Update
    if (scope.manager.isVRCompatible && scope.manager.mode === 3)
      raycasting();

    if(scope.useCrossHair && scope.manager.mode === 3)
      crossHairAnim();



    for (var property in scope.allPlugins) {
      if (scope.allPlugins.hasOwnProperty(property) && typeof scope.allPlugins[property].update === "function")
        scope.allPlugins[property].update(frameDelta);
    }

    //Update Scripts
    dispatch( events.update, { time: time, delta: time - prevTime } );

    //If an object get touched/clicked do it's update function
    if(eventObject !== null) // manager.getViewer().id !== "CardboardV1"
      dispatch( rayUpdate[ eventObject.uuid ] );

        // Update VR headset position and apply to camera.
    controls.update();

    // Render the scene through the manager.
    scope.manager.render(scope.scene, scope.camera, time);
    //effect.render(scope.scene, camera);


    prevTime = time; 

    request = requestAnimationFrame( animate );
    
  }

  ///////////////////////
  //Input - Functions
  ///////////////////////
  function clickCast(_x, _y, _type){

    if(scope.manager.mode == 3 ){//&& manager.getViewer().id == "CardboardV2"){

      //Set ray to forward vector from the camera
      var vector = new THREE.Vector3( 0, 0, -1 );
      vector.applyQuaternion( scope.camera.quaternion );

      raycaster.set( scope.camera.position, vector.normalize() );

    }else{

      mouse.x = ( _x / window.innerWidth ) * 2 - 1; // todo on pc mouse
      mouse.y = - ( _y / window.innerHeight ) * 2 + 1;

      raycaster.setFromCamera( mouse, scope.camera );
    }

    var _mouseIntersects = raycaster.intersectObjects( rayObjects );//scope.scene.children, true );
    var _sortedObj = sortIntersects(_mouseIntersects);

    if(_sortedObj === null){
      if(hoverObject !== null){
        if(rayEnd[hoverObject.uuid]) {
          dispatch( rayEnd[ hoverObject.uuid ] );
          hoverObject = null;

        }
      }
      return;
    }

    switch(_type) {

        case "start":
          if(rayStart[_sortedObj.uuid])
            dispatch( rayStart[ _sortedObj.uuid ] );

          if(rayUpdate[_sortedObj.uuid])
            eventObject = _sortedObj; 
       
        break;

        case "hover":

          if(hoverObject !== _sortedObj)  { // If new hover object

            if(hoverObject !== null && rayEnd[hoverObject.uuid])  
              dispatch( rayEnd[ hoverObject.uuid ] );

            hoverObject = _sortedObj; 

            if(rayHoverStart[hoverObject.uuid])  
              dispatch( rayHoverStart[ hoverObject.uuid ] );
           
          }else{ // If old hover object

            if(hoverObject !== null && rayHover[hoverObject.uuid]) 
              dispatch( rayHover[ hoverObject.uuid ] );

          }     
          
        break;

        case "end":

          if(rayEnd[_sortedObj.uuid])  
            dispatch( rayEnd[ _sortedObj.uuid ] );

          eventObject = null;
        break;

        default:
          console.log("Event-type missing!");
        break;
     
      }

  }

  function dispatch( array, event ) {

    for ( var i = 0, l = array.length; i < l; i ++ ) {

      try {

        array[ i ]( event );

      } catch ( e ) {

        console.error( ( e.message || e ), ( e.stack || '' ) );

      }
    }
  }

  function onDocumentKeyDown( event ) {

    dispatch( events.keydown, event );

    if (event.keyCode == 90) { // z
      controls.resetSensor();
    }

    //Debug eventes
    if(event.keyCode == 80) { // p

      if(running)
        pause();
      else
        resume();
    }

    // console.log(event.keyCode);

    if(event.keyCode == 73){
      scope.takeScreenshot(true);
    }
  }

  function onDocumentKeyUp( event ) {

    dispatch( events.keyup, event );

  }

  function onDocumentMouseDown( event ) {

    // if(manager.mode != 3){
      clickCast(event.clientX, event.clientY, "start");

      dispatch( events.mousedown, event );
    // }
  }

  function onDocumentMouseUp( event ) {

    // if(manager.mode != 3) {
      if(eventObject !== null && rayEnd[eventObject.uuid]) {
         
        dispatch( rayEnd[ eventObject.uuid ] );
        eventObject = null;

      }

      dispatch( events.mouseup, event );
    // }
  }

  function onDocumentMouseMove( event ) {

    // if(manager.mode != 3){
      dispatch( events.mousemove, event );

      clickCast(event.clientX, event.clientY, "hover");
    // }
  }

  function onDocumentTouchStart( event ) {

    //v1 quickjump
    // if(manager.mode == 3 ){//&& manager.getViewer().id == "CardboardV1"){
    //   lookAtTime = maxLookTime;
    //   return;
    // }

    var touch0 = event.changedTouches[0];

    clickCast(touch0.clientX, touch0.clientY, "start");

    dispatch( events.touchstart, event );

  }

  function onDocumentTouchEnd( event ) {

    unlockAudio();

    if(eventObject !== null && rayEnd[eventObject.uuid]) {
      dispatch( rayEnd[ eventObject.uuid ] );
      eventObject = null;
    }

    dispatch( events.touchend, event );

  }

  function onDocumentTouchMove( event ) {

    dispatch( events.touchmove, event );

  }

  //Exit to another website
  this.exit = function(_url){

    xhrLoader.crossOrigin = '';

    var _split = _url.split('/');

    var url;
    var found = false;

    for(var i = 0; i < _split.length; i++){
      if(_split[i] == "embed" || _split[i] == "projects" || _split[i] == "viewer"){
        url = BASE_URL + '/api/v1/entry/' + _split[i+1] + '/?format=json';
        found = true;
        break;
      }
    }

    if(!found){
      console.error("Trying to jump to a fake url: " + _url);
      return;
    }

    xhrLoader.load( url, function ( text ) {

      var _json = JSON.parse(text);

      transitionObject.position.copy(scope.camera.position);
      scope.scene.add( transitionObject );

      TweenMax.to(transitionObject.material, 0.8, {opacity: 1, onComplete:scope.loadProject, onCompleteParams:[BASE_URL + _json.scenes[0].data + "?v=md5("+_json.modified+")"]}); //onCompleteParams: [subsite]
      TweenMax.to('#loader', 0.3, {opacity:1});


    } );
  };

  this.changeControls = function(){


  };


  ///////////////////////
  //Fallback & Mobile - Functions
  ///////////////////////

  function webglAvailable() {
    try {
      var canvas = document.createElement( 'canvas' );
      return !!( window.WebGLRenderingContext && (
        canvas.getContext( 'webgl' ) ||
        canvas.getContext( 'experimental-webgl' ) )
      );
    } catch ( e ) {
      return false;
    }
  }

  ///////////////////////
  //AUDIO - Functions
  ///////////////////////

  //Unlock Audio on IOS
  var isUnlocked = false;
  function unlockAudio() {
        
    if(!iOS() )
      return;

    if( isUnlocked )
      return;

    // create empty buffer and play it
    var buffer = listener.context.createBuffer(1, 1, 22050);
    var source = listener.context.createBufferSource();
    source.buffer = buffer;
    source.connect(listener.context.destination);
    // console.log(source);
    source.start(0);

    // by checking the play state after some time, we know if we're really unlocked
    setTimeout(function() {
      if((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
        isUnlocked = true;
        console.log('AudioUnlocked');
      }
    }, 0);
  }

  function iOS() {

    var iDevices = [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ];

    while (iDevices.length) {
      if (navigator.platform === iDevices.pop()){ return true; }
    }

    return false;
  }

  //Toggle Master Volume
  function toggleMute(){

    var _volume = listener.getMasterVolume();

    if(_volume > 0.02)
      listener.setMasterVolume(0.01);
    else
      listener.setMasterVolume(1.0);
  }

  //Unmute Audio on Focus
  window.onfocus = function () { 
    listener.setMasterVolume(1);
  }; 

  //Mute Audio on Defocus
  window.onblur = function () { 
    listener.setMasterVolume(0.01);
  }; 

    window.addEventListener('resize', onResize, true);
  window.addEventListener('vrdisplaypresentchange', onResize, true);

  // Handle window resizes
  function onResize(e) {

    effect.setSize(window.innerWidth, window.innerHeight);
    scope.camera.aspect = window.innerWidth / window.innerHeight;
    scope.camera.updateProjectionMatrix();
    
  }

  var display;

  // Get the HMD, and if we're dealing with something that specifies
  // stageParameters, rearrange the scene.
  function setupStage() {
    navigator.getVRDisplays().then(function(displays) {
      if (displays.length > 0) {
        display = displays[0];
        if (display.stageParameters) {
          //setStageDimensions(display.stageParameters);
        }
      }
    });
  }
};

Viewer.prototype = {

  takeScreenshot: function( _save ) {

    _save = ( _save == undefined ) ? false : true;

    var dataUrl = this._renderer.domElement.toDataURL('image/png');

    if( _save ){
       var link = document.createElement("a");
      link.download = "ZAAKIO_screenshot.png";
      link.target = "_blank";

      // Construct the uri
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();

      // Cleanup the DOM
      document.body.removeChild(link);
      delete link;

    }

    //if (CARDBOARD_DEBUG) console.debug('SCREENSHOT: ' + dataUrl);
    return this._renderer.domElement.toDataURL('image/png');

  }
};