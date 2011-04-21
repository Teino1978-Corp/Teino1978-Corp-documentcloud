(function() {
  
  window.dc = window.dc || {};
  dc.embed = dc.embed || {};
  var notes = dc.embed.notes = dc.embed.notes || {};
  
  var _ = dc._        = window._.noConflict();
  var $ = dc.jQuery   = window.jQuery.noConflict(true);
  
  dc.embed.loadNote = function(embedUrl, opts) {
    var id = opts.note_id;
    notes[id] = notes[id] || {};
    notes[id].options = opts;
    
    var urlParams = '/documents/'   + encodeURIComponent(opts.document_id) +
                    '/annotations/' + encodeURIComponent(opts.note_id) + '.js';
    $.getScript(embedUrl + urlParams);
  };
  
  dc.embed.noteCallback = function(response) {
    var id         = response.id;
    var note       = new dc.embed.noteModel(response);
    var $container = $('#DC-note-' + id);
    var container;
    var containerWidth = $container.width();

    if (container = notes[id].options.container) {
      $container = $(container);
    }
    $container.html(JST['note_embed']({note : note}));
    if (containerWidth < 700) note.center($container, containerWidth);
  };
  
  dc.embed.noteModel = function(json) {
    this.attributes = json;
  };
  
  dc.embed.noteModel.prototype = {
    
    get : function(key) {
      return this.attributes[key];
    },
    
    option : function(key) {
      return dc.embed.notes[this.get('id')].options[key];
    },
    
    imageUrl : function() {
      return this._imageUrl = this._imageUrl ||
        this.get('image_url').replace('{size}', 'normal').replace('{page}', this.get('page'));
    },

    coordinates : function() {
      if (this._coordinates) return this._coordinates;
      var loc = this.get('location');
      if (!loc) return null;
      var css = _.map(loc.image.split(','), function(num){ return parseInt(num, 10); });
      return this._coordinates = {
        top:    css[0],
        left:   css[3],
        right:  css[1],
        height: css[2] - css[0],
        width:  css[1] - css[3]
      };
    },
    
    center : function($container) {
      var $excerpt       = $('.DC-note-excerpt', $container);
      var coords         = this._coordinates;
      if (!coords) return;
      var annoCenter     = coords.left + (coords.width / 2);
      var viewportWidth  = $excerpt.closest('.DC-note-excerpt-wrap').width();
      var viewportCenter = viewportWidth / 2;

      if (coords.left + coords.width > viewportWidth) {
        if (coords.width > viewportWidth) {
          $excerpt.css('left', -1 * coords.left);
        } else {
          $excerpt.css('left', viewportCenter - annoCenter);
        }
      }
    },
    
    viewerUrl : function() {
      var suffix = '#document/p' + this.get('page') + '/a' + this.get('id');
      return this.get('published_url') + suffix;
    }
    
  };
  
})();