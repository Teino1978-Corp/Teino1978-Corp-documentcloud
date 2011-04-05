dc.model.SearchQuery = Backbone.Collection.extend({
  
  model : dc.model.SearchFacet,
  
  find : function(category) {
    var facet = this.detect(function(facet) {
      return facet.get('category') == category;
    });
    return facet && facet.get('value');
  },
  
  count : function(category) {
    // TODO: Underscore.js 1.1.6 has a _.count, which is faster than a _.select.
    return this.select(function(facet) {
      return facet.get('category') == category;
    }).length;
  },
  
  values : function(category) {
    var facets = this.select(function(facet) {
      return facet.get('category') == category;
    });
    return _.map(facets, function(facet) { return facet.get('value'); });
  },
  
  has : function(category) {
    return this.any(function(facet) {
      return facet.get('category') == category;
    });
  },
  
  searchType : function() {
    var single   = false;
    var multiple = false;
    
    this.each(function(facet) {
      var category = facet.get('category');
      var value    = facet.get('value');
      
      if (value) {
        if (!single && !multiple) {
          single = category;
        } else {
          multiple = true;
          single = false;
        }
      }
    });

    if (single == 'filter') {
      return this.get('value');
    } else if (single == 'projectid') {
      return 'project';
    } else if (_.contains(['project', 'group', 'account'], single)) {
      return single;
    } else if (!single && !multiple) {
      return 'all';
    }
    
    return 'search';
  }
  
});

window.SearchQuery = new dc.model.SearchQuery();