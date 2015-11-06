// This file only makes sense in the context of the main platform.

(function(){
  
  var ENV = window.ENV        = window.ENV || {};
  ENV.config                  = ENV.config || {};
  ENV.config.embed            = ENV.config.embed || {};
  ENV.config.embed.assetPaths = ENV.config.embed.assetPaths || {};

  ENV.config.embed.assetPaths.page = {
    style: "//dev.dcloud.org/embed/page/page_embed.css",
    app:   "//dev.dcloud.org/embed/page/page_embed.js"
  };

})();

(function(){var Penny=window.Penny=window.Penny||{VERSION:'0.1.0',on:function(el,eventName,handler){if(el.addEventListener){el.addEventListener(eventName,handler);}else{el.attachEvent('on'+eventName,function(){handler.call(el);});}},ready:function(fn){if(document.readyState!='loading'){fn();}else if(document.addEventListener){document.addEventListener('DOMContentLoaded',fn);}else{document.attachEvent('onreadystatechange',function(){if(document.readyState!='loading'){fn();}});}},forEach:function(array,fn){var len=array.length;for(i=0;i<len;i++){fn(array[i],i);}},extend:function(out){out=out||{};for(var i=1;i<arguments.length;i++){if(!arguments[i]){continue;}
for(var key in arguments[i]){if(arguments[i].hasOwnProperty(key)){out[key]=arguments[i][key];}}}
return out;},};}());if(!window.console){window.console={log:function(message){},info:function(message){},warn:function(message){},error:function(message){},};}
(function(){Penny.ready(function(){var insertStylesheet=function(href){if(!document.querySelector('link[href$="'+href+'"]')){var stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.type='text/css';stylesheet.media='screen';stylesheet.href=href;document.querySelector('head').appendChild(stylesheet);}};var insertJavaScript=function(src,onLoadCallback){if(!document.querySelector('script[src$="'+src+'"]')){var page_embed_js=document.createElement('script');page_embed_js.src=src;Penny.on(page_embed_js,'load',onLoadCallback);document.querySelector('body').appendChild(page_embed_js);}};var generateUniqueElementId=function(resourceData){var i=1;var id='';switch(resourceData.type){case'page':id=resourceData.documentSlug+'-p'+resourceData.pageNumber+'-i'+i;break;}
while(document.getElementById(id)){id=id.replace(/-i[0-9]+$/,'-i'+i++);}
return id;};var extractOptionsFromStub=function(stub){var options=stub.getAttribute('data-options');if(options){try{options=JSON.parse(options);}
catch(err){console.error("Inline DocumentCloud embed options must be valid JSON. See https://www.documentcloud.org/help/publishing.");options={};}}else{options={};}
return options;};var extractResourceData=function(resource){var href,result;if(resource.nodeName==='A'){href=resource.getAttribute('href');}else{href=resource;resource=document.createElement('A');resource.href=href;}
var components=href&&href.match(/\/documents\/([A-Za-z0-9-]+)\.html\#document\/p([0-9]+)$/);if(components){var documentSlug=components[1];var path='/documents/'+documentSlug+'.json';result={type:'page',host:resource.host,path:path,documentSlug:documentSlug,pageNumber:components[2],resourceURL:resource.protocol+'//'+resource.host+path,embedOptions:{page:components[2],},};}else{console.error("The DocumentCloud URL you're trying to embed doesn't look right. Please generate a new embed code.");}
return result;};var enhanceStubs=function(){var stubs=document.querySelectorAll('.DC-embed');Penny.forEach(stubs,function(stub,i){if(stub.className.indexOf('DC-embed-enhanced')!=-1){return;}
var resourceElement=stub.querySelector('.DC-embed-resource');var resourceData=extractResourceData(resourceElement);if(resourceData){var elementId=generateUniqueElementId(resourceData);stub.className+=' DC-embed-enhanced';stub.setAttribute('data-resource-type',resourceData.type);stub.setAttribute('id',elementId);var embedOptions=Penny.extend({},extractOptionsFromStub(stub),resourceData.embedOptions,{container:'#'+elementId,});DocumentCloud.embed.loadPage('//'+resourceData.host+resourceData.path,embedOptions);}else{console.error("The DocumentCloud URL you're trying to embed doesn't look right. Please generate a new embed code.");}});};var chooseAssetPaths=function(){var defaultAssetPaths={page:{app:"/dist/page_embed.js",style:"/dist/page_embed.css"}};try{var configAssetPaths=window.ENV.config.embed.assetPaths;}
catch(e){var configAssetPaths={};}
return Penny.extend({},defaultAssetPaths,configAssetPaths);};var assetPaths=chooseAssetPaths();insertStylesheet(assetPaths.page.style);if(window.DocumentCloud){enhanceStubs();}else{insertJavaScript(assetPaths.page.app,enhanceStubs);}});})();