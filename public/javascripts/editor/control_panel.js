dc.ui.ViewerControlPanel = Backbone.View.extend({

  id : 'control_panel',

  events : {
    'click .set_sections':          'openSectionEditor',
    'click .public_annotation':     'togglePublicAnnotation',
    'click .private_annotation':    'togglePrivateAnnotation',
    'click .redact_annotation':     'toggleRedaction',
    'click .cancel_redactions':     'toggleRedaction',
    'click .save_redactions':       'saveRedactions',
    'click .edit_document_info':    'editDocumentInfo',
    'click .edit_description':      'editDescription',
    'click .edit_title':            'editTitle',
    'click .edit_source':           'editSource',
    'click .edit_related_article':  'editRelatedArticle',
    'click .edit_document_url':     'editPublishedUrl',
    'click .edit_remove_pages':     'editRemovePages',
    'click .edit_reorder_pages':    'editReorderPages',
    'click .edit_page_text':        'editPageText',
    'click .reprocess_text':        'reprocessText',
    'click .edit_replace_pages':    'editReplacePages',
    'click .toggle_document_info':  'toggleDocumentInfo',
    'click .embed_document':        'embedDocument',
    'click .embed_note':            'embedNote'
  },

  render : function() {
    var accountProto    = dc.model.Account.prototype;
    var accessWorkspace = dc.account.role == accountProto.ADMINISTRATOR ||
                          dc.account.role == accountProto.CONTRIBUTOR;
    this.viewer         = currentDocument;
    this._page          = this.viewer.$('.DV-textContents');
    $(this.el).html(JST['control_panel']({
      isReviewer      : dc.app.editor.options.isReviewer,
      isOwner         : dc.app.editor.options.isOwner,
      workspacePrefix : accessWorkspace ? '#' : ''
    }));
    this.showReviewerWelcome();
    return this;
  },

  showReviewerWelcome : function() {
    var inviter = dc.app.editor.options.reviewerInviter;
    if (!(dc.account.role == dc.model.Account.prototype.REVIEWER && inviter)) return;
    var title = inviter.fullName + ' has invited you to review "' +
      dc.inflector.truncate(currentDocument.api.getTitle(), 50) + '"';
    var description = JST['reviewer_welcome'](inviter);
    var dialog = dc.ui.Dialog.alert("", {description: description, title: title});
    $(dialog.el).addClass('wide_dialog');
    dialog.center();
  },

  openSectionEditor : function() {
    dc.app.editor.sectionEditor.open();
  },

  editDocumentInfo : function(e) {
    if ($(e.target).is('.toggle_document_info')) return;
    var doc = this._getDocumentCanonical({}, true);
    new dc.ui.DocumentDialog([doc]);
  },

  editTitle : function() {
    dc.ui.Dialog.prompt('Title', this.viewer.api.getTitle(), _.bind(function(title) {
      this.viewer.api.setTitle(title);
      this._updateDocument({title : title});
      return true;
    }, this), {mode : 'short_prompt'});
  },

  editSource : function() {
    dc.ui.Dialog.prompt('Source', this.viewer.api.getSource(), _.bind(function(source) {
      this.viewer.api.setSource(source);
      this._updateDocument({source : source});
      return true;
    }, this), {mode: 'short_prompt'});
  },

  editRelatedArticle : function() {
    dc.ui.Dialog.prompt('Related Article URL', this.viewer.api.getRelatedArticle(), _.bind(function(url, dialog) {
      url = dc.inflector.normalizeUrl(url);
      if (url && !dialog.validateUrl(url)) return false;
      this.viewer.api.setRelatedArticle(url);
      this._updateDocument({related_article : url});
      return true;
    }, this), {
      mode : 'short_prompt',
      description : 'Enter the URL of the article that references this document:'
    });
  },

  editPublishedUrl : function() {
    dc.ui.Dialog.prompt('Published URL', this.viewer.api.getPublishedUrl(), _.bind(function(url, dialog) {
      url = dc.inflector.normalizeUrl(url);
      if (url && !dialog.validateUrl(url)) return false;
      this.viewer.api.setPublishedUrl(url);
      this._updateDocument({remote_url : url});
      return true;
    }, this), {
      mode        : 'short_prompt',
      description : 'Enter the URL of the page on which this document is embedded:'
    });
  },

  editDescription : function() {
    dc.ui.Dialog.prompt('Description', this.viewer.api.getDescription(), _.bind(function(desc) {
      this.viewer.api.setDescription(desc);
      this._updateDocument({description : desc});
      return true;
    }, this));
  },

  reprocessText : function() {
    var self = this;
    var closeMessage = "The text is being processed. Please close this document.";
    var dialog = new dc.ui.Dialog.confirm("Reprocess this document to take \
        advantage of improvements to our text extraction tools. Choose \
        \"Force OCR\" (optical character recognition) to ignore any embedded \
        text information and use Tesseract before reprocessing. The document will \
        close while it's being rebuilt. Are you sure you want to proceed? ", function() {
      var doc = self._getDocumentCanonical();
      doc.reprocessText();
      self.setOnParent(doc, {access: dc.access.PENDING});
      $(dialog.el).remove();
      _.defer(dc.ui.Dialog.alert, closeMessage, {onClose: function(){ window.close(); }});
    }, {width: 450});
    var forceEl = $(dialog.make('span', {'class':'minibutton dark center_button'}, 'Force OCR')).bind('click', function() {
      var doc = self._getDocumentCanonical();
      doc.reprocessText(true);
      self.setOnParent(doc, {access: dc.access.PENDING});
      $(dialog.el).remove();
      _.defer(dc.ui.Dialog.alert, closeMessage, {onClose: function(){ window.close(); }});
    });
    dialog.$('.ok').text('Reprocess').before(forceEl);
  },

  openTextTab : function() {
    if (this.viewer.state != 'ViewText') {
        this.viewer.open('ViewText');
    }
  },

  openThumbnailsTab : function() {
    if (this.viewer.state != 'ViewThumbnails') {
        this.viewer.open('ViewThumbnails');
    }
  },

  openDocumentTab : function() {
    if (this.viewer.state != 'ViewDocument') {
        this.viewer.open('ViewDocument');
    }
  },

  editPageText : function() {
    this.openTextTab();
    dc.app.editor.editPageTextEditor.toggle();
  },

  editReplacePages : function() {
    this.openThumbnailsTab();
    dc.app.editor.replacePagesEditor.toggle();
  },

  editRemovePages : function() {
    this.openThumbnailsTab();
    dc.app.editor.removePagesEditor.toggle();
  },

  editReorderPages : function() {
    this.openThumbnailsTab();
    dc.app.editor.reorderPagesEditor.toggle();
  },

  togglePublicAnnotation : function() {
    this.openDocumentTab();
    dc.app.editor.annotationEditor.toggle('public');
  },

  togglePrivateAnnotation : function() {
    this.openDocumentTab();
    dc.app.editor.annotationEditor.toggle('private');
  },

  toggleRedaction : function() {
    this.openDocumentTab();
    dc.app.editor.annotationEditor.toggle('redact');
  },

  toggleDocumentInfo : function() {
    var showing = $('.edit_document_fields').is(':visible');
    $('.document_fields_container').setMode(showing ? 'hide' : 'show', 'document_fields');
    $('.document_fields_container .toggle').setMode(showing ? 'not' : 'is', 'enabled');
  },

  embedDocument : function() {
    var doc = this._getDocumentModel();
    (new dc.ui.DocumentEmbedDialog(doc)).render();
  },
  
  embedNote : function() {
    var doc = this._getDocumentModel();
    console.log(['doc', doc]);
    Documents.refresh([doc]);
    dc.app.noteEmbedDialog = new dc.ui.NoteEmbedDialog(doc);
  },
  
  saveRedactions : function() {
    var modelId = this.viewer.api.getModelId();
    var redactions = dc.app.editor.annotationEditor.redactions;
    if (!redactions.length) return dc.app.editor.annotationEditor.close();
    var message = "You've redacted " + redactions.length + " " +
      dc.inflector.pluralize('passage', redactions.length) +
      ". This document will close while it's being rebuilt. Are you sure you're ready to proceed?";
    dc.ui.Dialog.confirm(message, _.bind(function() {
      $.ajax({
        url       : '/documents/' + modelId + '/redact_pages',
        type      : 'POST',
        data      : {redactions : JSON.stringify(redactions)},
        dataType  : 'json',
        success   : _.bind(function(resp) {
          this.setOnParent(modelId, resp);
          window.close();
          _.defer(dc.ui.Dialog.alert, "The document is being redacted. Please close this document.");
        }, this)
      });
      return true;
    }, this));
  },

  setOnParent : function(doc, attrs) {
    try {
      var doc = window.opener && window.opener.Documents && window.opener.Documents.get(doc);
      if (doc) doc.set(attrs);
    } catch (e) {
      // Couldn't access the parent window -- it's ok.
    }
  },

  _getDocumentCanonical : function(attrs, full) {
    if (full) {
      var schema = this.viewer.api.getSchema();
      attrs = _.extend({}, schema, attrs);
    }
    attrs = attrs || {};
    attrs.id = parseInt(this.viewer.api.getId(), 10);
    return new dc.model.Document(_.clone(attrs));
  },
  
  _getDocumentModel : function(attrs) {
    if (this.docModel) return this.docModel;
    attrs = attrs || {};
    attrs = _.extend({}, window.currentDocumentModel, attrs);
    this.docModel = new dc.model.Document(_.clone(attrs));
    return this.docModel;
  },

  _updateDocument : function(attrs) {
    var doc = this._getDocumentCanonical(attrs);
    doc.save();
    this.setOnParent(doc, attrs);
  }

});