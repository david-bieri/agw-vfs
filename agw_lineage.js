/* agw_lineage.js — HET Lineages panel (vanilla, foundation-style)
 * ───────────────────────────────────────────────────────────────────
 * Renders AGW.LINEAGE (from agw_lineage_data.js) into #hetl-mount on
 * analytics.html. No bundler — matches the agw_chronik.js precedent.
 * Subscribes to the shared 'agw-lang-change' event (detail = 'de'|'en',
 * dispatched by AGW.setLang in agw_strings.js). All classes namespaced
 * 'hetl-' to avoid collisions with page/bundle styles.
 * Names are never translated (ADR-014); only chrome/labels/descriptors.
 */
(function () {
  "use strict";
  if (!window.AGW || !AGW.LINEAGE) return;            // data guard
  var mount = document.getElementById("hetl-mount");
  if (!mount) return;                                 // render guard (ADR-016) — no-op on other pages

  var D = AGW.LINEAGE, lanes = D.lanes, figs = D.figures, edges = D.edges, BIB = D.bib || {};
  var SVGNS = "http://www.w3.org/2000/svg";
  var lang = (AGW.getLang && AGW.getLang()) || "de";

  var STR = {
    title:{de:"HET-Stammbaum der deutschsprachigen Ökonomie",en:"HET Lineages of German-language Economics"},
    intro:{de:"Lehrer-, Schüler- und Einflussbeziehungen entlang der deutschsprachigen Tradition, mit internationalen Ankern. Knoten anklicken, um eine Linie zu verfolgen; über eine Kante fahren für die Quelle.",
           en:"Teacher, student and influence ties along the German-language tradition, with international anchors. Click a node to trace a line; hover an edge for its source."},
    note:{de:"Erster kuratierter Entwurf. Kantenfarbe = Sicherheit (blau: belegt; grau: Einfluss; gepunktet: Parallelentdeckung; gestrichelt gold: Methodenstreit). Knotengröße = Belegdichte im Manuskript. „M“ = Beleg im Lösch-Manuskript; „Ref.“ = HET-Standardreferenz.",
          en:"First curated draft. Edge colour = confidence (blue: attested; grey: influence; dotted: parallel discovery; dashed gold: Methodenstreit). Node size = manuscript coverage. \u201cM\u201d = manuscript evidence; \u201cRef.\u201d = standard HET reference."},
    kstrong:{de:"belegt (Lehrer/Seminar/Gutachter)",en:"attested (teacher/seminar/examiner)"},
    kinfl:{de:"Einfluss",en:"influence"}, kpar:{de:"Parallelentdeckung",en:"parallel discovery"},
    kstreit:{de:"Methodenstreit",en:"Methodenstreit"},
    prov_ms:{de:"Manuskript",en:"Manuscript"}, prov_ref:{de:"Ref.",en:"Ref."}
  };

  // ── build chrome inside the mount ──
  function mk(tag, cls){ var n=document.createElement(tag); if(cls) n.className=cls; return n; }
  var head = mk("div","hetl-head");
  var hTitle = mk("h2","hetl-title"); var hIntro = mk("p","hetl-intro");
  head.appendChild(hTitle); head.appendChild(hIntro); mount.appendChild(head);
  var svg = document.createElementNS(SVGNS,"svg");
  svg.setAttribute("id","hetl-svg"); svg.setAttribute("role","img");
  svg.setAttribute("aria-label","HET lineage graph"); mount.appendChild(svg);
  var legend = mk("div","hetl-legend"); mount.appendChild(legend);
  var note = mk("p","hetl-note"); mount.appendChild(note);
  var tip = mk("div","hetl-tip"); tip.id = "hetl-tip"; tip.setAttribute("aria-hidden","true");
  document.body.appendChild(tip);

  var byId={}; figs.forEach(function(f){byId[f.id]=f;});
  var laneIx={}; lanes.forEach(function(l,i){laneIx[l.id]=i;});

  function el(n,a){var e=document.createElementNS(SVGNS,n);for(var k in a)e.setAttribute(k,a[k]);return e;}

  // ── computed layout: x by birth year, y by lane + collision stagger ──
  var W=1320, PADX=120, bMin=1715, bMax=1925;
  function xOf(y){return PADX + (y-bMin)/(bMax-bMin)*(W-2*PADX);}
  var BAND=150, TOP=46, H=TOP+lanes.length*BAND+40;
  lanes.forEach(function(l,li){
    var inLane=figs.filter(function(f){return f.lane===l.id;}).sort(function(a,b){return a.b-b.b;});
    var cy=TOP+li*BAND+BAND/2, lastX=-1e9, slot=0;
    inLane.forEach(function(f){
      var x=xOf(f.b);
      if(x-lastX<86){slot=(slot+1)%4;}else{slot=0;}
      f._x=x; f._y=cy+[0,-34,34,-66][slot]; lastX=x;
    });
  });
  function rOf(f){return 5+Math.min(Math.sqrt(f.w||0)*1.1,8);}

  var up={},down={}; figs.forEach(function(f){up[f.id]=[];down[f.id]=[];});
  edges.forEach(function(e){if(e.kind==="parallel"||e.kind==="methodenstreit")return;down[e.s].push(e.t);up[e.t].push(e.s);});
  function lineage(id){var s={};s[id]=1;var st=[id];while(st.length){var n=st.pop();up[n].forEach(function(u){if(!s[u]){s[u]=1;st.push(u);}});}st=[id];while(st.length){var n=st.pop();down[n].forEach(function(d){if(!s[d]){s[d]=1;st.push(d);}});}return s;}
  function edgePath(a,c){var dx=c._x-a._x,dy=c._y-a._y,len=Math.sqrt(dx*dx+dy*dy)||1,k=Math.min(Math.max(len*0.09,12),50),mx=(a._x+c._x)/2,my=(a._y+c._y)/2,px=-dy/len,py=dx/len;if(py>0){px=-px;py=-py;}return "M"+a._x+" "+a._y+" Q"+(mx+px*k)+" "+(my+py*k)+" "+c._x+" "+c._y;}

  function build(){
    while(svg.firstChild)svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox","0 0 "+W+" "+H);
    var defs=el("defs",{});
    [["hetl-arrow-strong","#1B3A6B"],["hetl-arrow-influence","#9aa6b4"]].forEach(function(a){
      var m=el("marker",{id:a[0],viewBox:"0 0 10 10",refX:"9",refY:"5",markerWidth:"7",markerHeight:"7",orient:"auto-start-reverse"});
      m.appendChild(el("path",{d:"M0 0 L10 5 L0 10 z",fill:a[1]})); defs.appendChild(m);
    });
    svg.appendChild(defs);
    lanes.forEach(function(l,li){
      var y0=TOP+li*BAND;
      svg.appendChild(el("rect",{x:14,y:y0+6,width:W-28,height:BAND-12,rx:8,fill:l.color,"class":"hetl-laneband"}));
      var t=el("text",{x:26,y:y0+22,"class":"hetl-lanelabel",fill:l.color,"data-lane":l.id}); t.textContent=l[lang]; svg.appendChild(t);
    });
    var ax=el("g",{"class":"hetl-axis"});
    [1750,1800,1850,1900].forEach(function(yr){var x=xOf(yr);ax.appendChild(el("line",{x1:x,y1:TOP,x2:x,y2:H-30,"stroke-dasharray":"2 6"}));var t=el("text",{x:x,y:H-14,"text-anchor":"middle"});t.textContent=yr;ax.appendChild(t);});
    svg.appendChild(ax);
    var gE=el("g",{});
    edges.forEach(function(e){var a=byId[e.s],c=byId[e.t];if(!a||!c)return;var p=el("path",{d:edgePath(a,c),"class":"hetl-edge k-"+e.kind,"data-s":e.s,"data-t":e.t});if(e.kind==="strong")p.setAttribute("marker-end","url(#hetl-arrow-strong)");else if(e.kind==="influence")p.setAttribute("marker-end","url(#hetl-arrow-influence)");p.addEventListener("mouseenter",function(ev){edgeTip(ev,e,a,c);});p.addEventListener("mousemove",moveTip);p.addEventListener("mouseleave",hideTip);gE.appendChild(p);});
    svg.appendChild(gE);
    var gN=el("g",{});
    figs.forEach(function(f){var g=el("g",{"class":"hetl-node","data-id":f.id});g.appendChild(el("circle",{cx:f._x,cy:f._y,r:rOf(f),fill:lanes[laneIx[f.lane]].color}));var t=el("text",{x:f._x,y:f._y-rOf(f)-5,"class":"hetl-name"});t.textContent=f.name;g.appendChild(t);g.addEventListener("mouseenter",function(ev){if(!locked)applyFocus(lineage(f.id));nodeTip(ev,f);});g.addEventListener("mousemove",moveTip);g.addEventListener("mouseleave",function(){if(!locked)clearFocus();hideTip();});g.addEventListener("click",function(ev){ev.stopPropagation();toggleLock(f);});gN.appendChild(g);});
    svg.appendChild(gN);
  }

  var locked=null;
  function applyFocus(set){svg.classList.add("hetl-has-focus");svg.querySelectorAll(".hetl-node").forEach(function(g){g.classList.toggle("hetl-on",!!set[g.getAttribute("data-id")]);});svg.querySelectorAll(".hetl-edge").forEach(function(p){var c=p.getAttribute("class");var on=set[p.getAttribute("data-s")]&&set[p.getAttribute("data-t")]&&c.indexOf("methodenstreit")<0&&c.indexOf("parallel")<0;p.classList.toggle("hetl-on",on);});}
  function clearFocus(){svg.classList.remove("hetl-has-focus");svg.querySelectorAll(".hetl-on").forEach(function(n){n.classList.remove("hetl-on");});}
  function toggleLock(f){if(locked===f.id){locked=null;clearFocus();}else{locked=f.id;applyFocus(lineage(f.id));}}
  svg.addEventListener("click",function(){if(locked){locked=null;clearFocus();}});

  function nodeTip(ev,f){tip.innerHTML='<div class="hetl-tn">'+f.full+'</div><div class="hetl-td">'+f.b+'\u2013'+f.d+'</div><div class="hetl-ts">'+f[lang]+'</div>'+(f.w>0?'<div class="hetl-prov"><span class="hetl-badge hetl-b-ms">'+STR.prov_ms[lang]+'</span>'+f.w+' \u00d7 Personenregister</div>':'');show(ev);}
  function kindLabel(k){return ({strong:STR.kstrong,influence:STR.kinfl,parallel:STR.kpar,methodenstreit:STR.kstreit}[k]||{de:k,en:k})[lang];}
  function edgeTip(ev,e,a,c){var e0=(e.ev&&e.ev[0])||{};var prov;if(e0.t==="ms"){var sc=(BIB[e0.cite])||e0.cite||"";prov='<span class="hetl-badge hetl-b-ms">'+STR.prov_ms[lang]+'</span>'+sc+(e0.loc?', '+e0.loc:'');}else{prov='<span class="hetl-badge hetl-b-ref">'+STR.prov_ref[lang]+'</span>'+(e0.cite||"");}var n=e0.note?('<br>'+e0.note):"";tip.innerHTML='<div class="hetl-tn" style="font-size:13.5px">'+a.name+' \u2192 '+c.name+'</div><div class="hetl-td">'+kindLabel(e.kind)+'</div><div class="hetl-prov">'+prov+n+'</div>';show(ev);}
  function show(ev){tip.classList.add("hetl-show");tip.setAttribute("aria-hidden","false");moveTip(ev);}
  function moveTip(ev){var x=ev.clientX+16,y=ev.clientY+16;if(x+280>window.innerWidth)x=ev.clientX-280;if(y+120>window.innerHeight)y=ev.clientY-120;tip.style.left=x+"px";tip.style.top=y+"px";}
  function hideTip(){tip.classList.remove("hetl-show");tip.setAttribute("aria-hidden","true");}

  function legendHtml(){var h="";lanes.forEach(function(l){h+='<span class="hetl-grp"><span class="hetl-swatch" style="background:'+l.color+'"></span><span>'+l[lang]+'</span></span>';});h+='<span class="hetl-grp"><span class="hetl-lk" style="border-top-color:#1B3A6B"></span>'+STR.kstrong[lang]+'</span>';h+='<span class="hetl-grp"><span class="hetl-lk" style="border-top-color:#9aa6b4"></span>'+STR.kinfl[lang]+'</span>';h+='<span class="hetl-grp"><span class="hetl-lk" style="border-top-color:#b0a88f;border-top-style:dotted"></span>'+STR.kpar[lang]+'</span>';h+='<span class="hetl-grp"><span class="hetl-lk" style="border-top-color:#C8A04B;border-top-style:dashed"></span>'+STR.kstreit[lang]+'</span>';return h;}

  function setLangLocal(l){
    lang=(l==="en")?"en":"de";
    hTitle.textContent=STR.title[lang]; hIntro.textContent=STR.intro[lang]; note.textContent=STR.note[lang];
    svg.querySelectorAll("[data-lane]").forEach(function(n){var ld=lanes[laneIx[n.getAttribute("data-lane")]];if(ld)n.textContent=ld[lang];});
    legend.innerHTML=legendHtml();
  }

  build();
  setLangLocal(lang);
  window.addEventListener("agw-lang-change", function(e){ setLangLocal(e.detail); });  // detail is the lang string
})();
