/** sessionStorage key: the ids of the cases the reader left open. */
export const OPEN_CASES_KEY = "open-cases";

/**
 * Runs during HTML parsing, right after the list, before the first paint:
 * decides which cases are open, so nothing opens (and pushes the page)
 * after a shared #case link has landed.
 *
 * - Coming back (Back, Forward or reload) restores the cases the reader
 *   had open in this tab.
 * - Otherwise the featured cases open: all of them from md up, the first
 *   one on phones, where the rest of the list stays an outline.
 */
export const openCasesScript = `(function(){try{
var list=document.querySelectorAll("#work details.log-entry");
var nav=performance.getEntriesByType("navigation")[0];
var saved=null;
if(nav&&(nav.type==="back_forward"||nav.type==="reload")){
try{saved=JSON.parse(sessionStorage.getItem(${JSON.stringify(OPEN_CASES_KEY)})||"null")}catch(e){}
}
var wide=matchMedia("(min-width: 48rem)").matches;
var n=0;
for(var i=0;i<list.length;i++){
var d=list[i],f=d.hasAttribute("data-featured");
d.open=saved?saved.indexOf(d.id)>=0:f&&(wide||n===0);
if(f)n++;
}
}catch(e){}})()`.replace(/\n/g, "");
