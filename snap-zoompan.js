Snap.plugin(function (Snap, Element, Paper, global) {
  var elproto = Element.prototype;

  var zoomScale = 0.2; // Zoom sensitivity
  var stateTf;

  elproto.panable = function () {
    var self  = this
      , state = ''
      , stateOrigin;

    var viewport = this.node.nearestViewportElement;

    viewport.addEventListener('mousemove', handleMouseMove, false);
    viewport.addEventListener('mousedown', handleMouseDown, false);
    viewport.addEventListener('mouseup', handleMouseUp, false);

    return this;

    function handleMouseMove (e) {
      if (e.preventDefault)
        e.preventDefault();

      var CTM = self.transform().localMatrix.clone();
      var p = new Snap.Matrix(0, 0, 0, 0, e.clientX, e.clientY);

      if (state === 'pan') {
        p = stateTf.clone().add(p);
        self.transform(
          stateTf.invert()
                 .translate(p.e - stateOrigin.e, p.f - stateOrigin.f)
        );
      }
    }

    function handleMouseDown (e) {
      if (e.preventDefault)
        e.preventDefault();

      state = 'pan';

      var CTM = self.transform().localMatrix.clone();
      var p   = new Snap.Matrix(0, 0, 0, 0, e.clientX, e.clientY);

      stateTf = CTM.invert();
      stateOrigin = stateTf.clone().add(p);
    }

    function handleMouseUp (e) {
      if (e.preventDefault)
        e.preventDefault();

      state = '';
    }

  }

  elproto.zoomable = function (opt) {
    var self = this;

    opt = opt || {};

    var eventNode = opt.bindToViewport ? this.node.nearestViewportElement
                                       : this.node;

    registerMouseWheelHandler(eventNode, handler);

    return this;

    function handler (e) {
      if (e.preventDefault)
        e.preventDefault();

      var delta = e.wheelDelta ? e.wheelDelta / 360 : e.detail / -9;
      var z     = Math.pow(1 + zoomScale, delta);

      var CTM = self.transform().localMatrix.clone();
      var p   = new Snap.Matrix(0, 0, 0, 0, e.clientX, e.clientY);
      p = CTM.invert().add(p);

      var k = new Snap.Matrix().translate(p.e, p.f)
                               .scale(z)
                               .translate(-p.e, -p.f);

      self.transform(CTM.add(k));

      if (typeof(stateTf) === 'undefined')
        stateTf = CTM.invert();

      stateTf.add(k.invert());
    }

  }

// Why no mousewheel handler in Snap?
  function registerMouseWheelHandler (node, cb) {
    if (navigator.userAgent.toLowerCase().indexOf('webkit') >= 0) {
      node.addEventListener('mousewheel', cb, false);
    } else {
      node.addEventListener('DOMMouseScroll', cb, false);
    }
  }

});