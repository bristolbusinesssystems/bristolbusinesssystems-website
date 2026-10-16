/* Homepage hero orrery + starfield. Copied from /demo/hero/. */
(function(){
  var NS='http://www.w3.org/2000/svg', CX=320, CY=262, VB={x:-20,y:40,w:680,h:470};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag,attrs,parent){var n=document.createElementNS(NS,tag);for(var k in attrs)n.setAttribute(k,attrs[k]);if(parent)parent.appendChild(n);return n;}
  var $=function(id){return document.getElementById(id);};



  /* orbits */
  var RINGS=[{a:168,b:68,tilt:-6,period:30},{a:236,b:96,tilt:5,period:46},{a:300,b:122,tilt:-3,period:66}];
  var rb=$('rings-back'), rf=$('rings-front');
  RINGS.forEach(function(R){
    var tf='rotate('+R.tilt+' '+CX+' '+CY+')';
    R.gb=el('g',{transform:tf},rb); R.gf=el('g',{transform:tf},rf);
    el('path',{class:'ring-back',d:'M'+(CX-R.a)+' '+CY+' A'+R.a+' '+R.b+' 0 0 1 '+(CX+R.a)+' '+CY},R.gb);
    el('path',{class:'ring-front',d:'M'+(CX+R.a)+' '+CY+' A'+R.a+' '+R.b+' 0 0 1 '+(CX-R.a)+' '+CY},R.gf);
    var t='';for(var i=0;i<96;i++){var th=i/96*2*Math.PI;if(Math.sin(th)<0)continue;var x1=CX+R.a*Math.cos(th),y1=CY+R.b*Math.sin(th),k=i%8?3:7;
      var nx=Math.cos(th)/R.a,ny=Math.sin(th)/R.b,nl=Math.hypot(nx,ny);t+='M'+x1.toFixed(1)+' '+y1.toFixed(1)+'l'+(nx/nl*k).toFixed(1)+' '+(ny/nl*k).toFixed(1);}
    el('path',{class:'ticks',d:t},R.gf);
  });

  /* planets */
  var ICON={
    bookings:'M-7-6h14v13h-14z M-7-2h14 M-3-9v4 M3-9v4',
    followups:'M-8-6h16v10h-9l-4 4v-4h-3z',
    crm:'M-3-1a3 3 0 1 0 0.01 0 M-9 8c1-4 4-6 6-6s5 2 6 6 M4-4h5 M4 0h5',
    invoicing:'M-6-9h12v18l-3-2-3 2-3-2-3 2z M-3-4h6 M-3 0h6 M-3 4h3',
    website:'M-9-7h18v14h-18z M-9-3h18',
    reporting:'M-8 8h16 M-5 8v-6 M0 8v-11 M5 8v-8',
    sops:'M-6-8h12v16h-12z M-3-4l1.5 1.5 3-3 M-3 3l1.5 1.5 3-3',
    automations:'M2-9l-8 11h6l-2 7 8-11h-6z'
  };
  var PLANETS=[
    {k:'bookings',name:'Bookings',d:'Confirmed and reminded automatically.',ring:0,phase:0.3,r:23,c:['#b6f0d2','#3a9a6b','#0f4a2e'],surf:'bands'},
    {k:'followups',name:'Follow-ups',d:'No lead left waiting.',ring:0,phase:3.5,r:21,c:['#bdeee8','#2f8f88','#0d3f3b'],surf:'craters'},
    {k:'crm',name:'CRM',d:'Every customer and deal in one place.',ring:1,phase:1.0,r:27,c:['#c9f0d6','#2a7d55','#0c3a24'],surf:'bands',rings:'#e3c98f'},
    {k:'invoicing',name:'Invoicing',d:'Sent on time, every time.',ring:1,phase:3.1,r:24,c:['#fdeec7','#c99b4f','#5e3f14'],surf:'bands'},
    {k:'website',name:'Website',d:'Turns visitors into requests.',ring:1,phase:5.2,r:23,c:['#d2f5ec','#3fae95','#0f4d43'],surf:'storm',atmo:1},
    {k:'reporting',name:'Reporting',d:'Monday 7am, in your inbox.',ring:2,phase:0.7,r:23,c:['#e2f3d3','#6b9c4b','#24401a'],surf:'craters',moon:1},
    {k:'sops',name:'Team SOPs',d:'Everyone does it the same way.',ring:2,phase:2.8,r:21,c:['#eef4ea','#8fae99','#3a5646'],surf:'craters'},
    {k:'automations',name:'Automations',d:'The busywork runs itself.',ring:2,phase:4.7,r:22,c:['#d3fbe2','#2fbf72','#0b4d2a'],surf:'bands',rings:'#7fe0b4'}
  ];
  var defs=document.querySelector('#sky defs'), lb=$('layer-back'), lf=$('layer-front');
  function ringArc(r,back){var rx=r*1.85,ry=r*.5;return back?'M'+(-rx)+' 0 A'+rx+' '+ry+' 0 0 1 '+rx+' 0':'M'+rx+' 0 A'+rx+' '+ry+' 0 0 1 '+(-rx)+' 0';}

  PLANETS.forEach(function(p){
    var gid='g-'+p.k, cid='c-'+p.k, r=p.r;
    var g0=el('radialGradient',{id:gid,cx:'38%',cy:'34%',r:'72%'},defs);
    el('stop',{offset:'0','stop-color':p.c[0]},g0); el('stop',{offset:'.55','stop-color':p.c[1]},g0); el('stop',{offset:'1','stop-color':p.c[2]},g0);
    var cp=el('clipPath',{id:cid},defs); el('circle',{r:r},cp);

    var g=el('g',{class:'planet',tabindex:'0',role:'button','aria-label':p.name+': '+p.d});
    var inner=el('g',{},g);
    p.halo=el('circle',{r:r*2.1,fill:'url(#halo)',opacity:0},inner);
    if(p.rings) el('path',{d:ringArc(r,true),fill:'none',stroke:p.rings,'stroke-width':2.6,opacity:.5,transform:'rotate(-16)'},inner);
    if(p.moon){p.moonBack=el('circle',{r:4.2,fill:'#cfd8c6'},inner);}
    var planet=el('g',{'clip-path':'url(#'+cid+')'},inner);
    el('circle',{r:r,fill:'url(#'+gid+')'},planet);
    var surf=el('g',{transform:'rotate(-14)'},planet);
    if(p.surf==='bands'){[-.55,-.18,.2,.52].forEach(function(y,i){el('ellipse',{cx:0,cy:(y*r).toFixed(1),rx:r*1.3,ry:(r*(.07+.04*(i%2))).toFixed(1),fill:i%2?'#000':'#fff',opacity:i%2?.16:.14},surf);});}
    if(p.surf==='craters'){[[-.35,-.3,.22],[.3,.15,.16],[-.1,.45,.13],[.45,-.4,.1]].forEach(function(c){el('circle',{cx:(c[0]*r).toFixed(1),cy:(c[1]*r).toFixed(1),r:(c[2]*r).toFixed(1),fill:'#000',opacity:.18},surf);el('circle',{cx:(c[0]*r-.8).toFixed(1),cy:(c[1]*r-.8).toFixed(1),r:(c[2]*r).toFixed(1),fill:'none',stroke:'#fff','stroke-width':.8,opacity:.25},surf);});}
    if(p.surf==='storm'){el('ellipse',{cx:r*.25,cy:r*.2,rx:r*.32,ry:r*.16,fill:'#fff',opacity:.22},surf);el('path',{d:'M'+(-r)+' '+(-r*.25)+' q'+r*.6+' '+(-r*.25)+' '+r*1.1+' 0 t'+r*1.1+' 0',fill:'none',stroke:'#fff','stroke-width':2,opacity:.16},surf);}
    p.shade=el('circle',{r:r,fill:'url(#shade)'},planet);
    p.spec=el('circle',{r:r*.55,fill:'url(#spec)'},planet);
    el('circle',{r:r+(p.atmo?2.2:1),fill:'none',stroke:p.c[0],'stroke-width':p.atmo?3:1.2,opacity:p.atmo?.45:.3},inner);
    var ic=el('path',{class:'icon',d:ICON[p.k]},inner); ic.setAttribute('transform','scale('+(r/24).toFixed(2)+')');
    if(p.rings) el('path',{d:ringArc(r,false),fill:'none',stroke:p.rings,'stroke-width':2.6,opacity:.9,transform:'rotate(-16)'},inner);
    if(p.moon){p.moonFront=el('circle',{r:4.2,fill:'#e6ecdf'},inner);}
    el('circle',{class:'focusring',r:r+7},inner);
    el('circle',{r:r+16,fill:'transparent'},g);          // generous, still hit area
    p.label=el('text',{class:'label',y:r+20,'text-anchor':'middle'},g); p.label.textContent=p.name;
    p.g=g; p.side=null; p.boost=0; p.dim=1;
    bind(p);
  });

  /* focus: freeze the system, lift the chosen planet, caption beside it */
  var focused=null, pinned=false, clearT=null, cap=$('cap'), hint=$('hint'), fig=$('orrery'), svg=$('sky');
  if(window.matchMedia('(hover: none)').matches)hint.textContent='Tap a planet to see what it does';
  fig.addEventListener('pointermove',function(e){if(e.pointerType==='mouse')hint.textContent='Point at a planet to see what it does';},{once:true});
  function setFocus(p){clearTimeout(clearT);focused=p;$('capt').textContent=p.name;$('capd').textContent=p.d;$('capdot').style.background=p.c[1];
    RINGS.forEach(function(R,i){var on=i===p.ring;R.gb.classList.toggle('ring-on',on);R.gf.classList.toggle('ring-on',on);});
    cap.classList.add('show');hint.style.opacity=0;}
  function clearFocus(){focused=null;pinned=false;cap.classList.remove('show');hint.style.opacity=1;
    RINGS.forEach(function(R){R.gb.classList.remove('ring-on');R.gf.classList.remove('ring-on');});}
  function bind(p){
    p.g.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')setFocus(p);});
    p.g.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'&&!pinned){clearTimeout(clearT);clearT=setTimeout(clearFocus,350);}});
    p.g.addEventListener('focus',function(){setFocus(p);});
    p.g.addEventListener('blur',function(){if(!pinned)clearFocus();});
    p.g.addEventListener('click',function(e){e.stopPropagation();if(focused===p&&pinned){clearFocus();}else{setFocus(p);pinned=true;}});
    p.g.addEventListener('keydown',function(e){if(e.key==='Escape'){clearFocus();p.g.blur();}});
  }
  fig.addEventListener('click',function(){if(pinned)clearFocus();});

  function placeCaption(p){
    var m=svg.getScreenCTM(), fr=fig.getBoundingClientRect(); if(!m)return;
    var pt=svg.createSVGPoint(); pt.x=p.x; pt.y=p.y; var s=pt.matrixTransform(m);
    var x=s.x-fr.left, y=s.y-fr.top, w=cap.offsetWidth, h=cap.offsetHeight, gap=p.r*m.a*1.5+14;
    var left=x+gap+w<fr.width-12?x+gap:x-gap-w;
    var top=Math.min(Math.max(12,y-h/2),fr.height-h-12);
    left=Math.min(Math.max(12,left),fr.width-w-12);
    cap.style.left=left.toFixed(0)+'px'; cap.style.top=top.toFixed(0)+'px';
  }

  function place(p,theta,now){
    var R=RINGS[p.ring], tr=R.tilt*Math.PI/180;
    var ex=R.a*Math.cos(theta), ey=R.b*Math.sin(theta);
    var x=CX+ex*Math.cos(tr)-ey*Math.sin(tr), y=CY+ex*Math.sin(tr)+ey*Math.cos(tr);
    var depth=(Math.sin(theta)+1)/2, s=.76+.32*depth;
    var side=Math.sin(theta)<0?'back':'front';
    if(focused===p)side='front';                         // a chosen planet always sits in front
    if(side!==p.side){(side==='back'?lb:lf).appendChild(p.g);p.side=side;}
    p.x=x; p.y=y;
    var tb=focused===p?1:0, td=focused&&focused!==p?.32:1;
    p.boost+=(tb-p.boost)*.18; p.dim+=(td-p.dim)*.18;
    p.sc=s*(1+.35*p.boost);
    p.g.setAttribute('transform','translate('+x.toFixed(2)+' '+y.toFixed(2)+') scale('+p.sc.toFixed(3)+')');
    p.g.style.opacity=((.6+.4*depth+(1-.6-.4*depth)*p.boost)*p.dim).toFixed(3);
    var ping=p.ping?Math.max(0,1-Math.abs(now-p.ping)/700):0;
    p.halo.setAttribute('opacity',Math.max(p.boost*.9,ping*.75).toFixed(2));
    // light comes from the shop: the shadow faces away from it
    var ang=Math.atan2(y-CY,x-CX);
    p.shade.setAttribute('transform','rotate('+(ang*180/Math.PI).toFixed(1)+')');
    var sr=p.r*.42; p.spec.setAttribute('cx',(-Math.cos(ang)*sr).toFixed(1)); p.spec.setAttribute('cy',(-Math.sin(ang)*sr).toFixed(1));
    var hide=side==='back'&&Math.abs(x-CX)<125&&y<CY+70;
    p.label.style.opacity=hide?0:1;
    if(p.moon){var ma=now/1400, mx=Math.cos(ma)*p.r*1.6, my=Math.sin(ma)*p.r*.45, front=Math.sin(ma)>0;
      p.moonFront.setAttribute('cx',mx.toFixed(1));p.moonFront.setAttribute('cy',my.toFixed(1));p.moonFront.style.display=front?'':'none';
      p.moonBack.setAttribute('cx',mx.toFixed(1));p.moonBack.setAttribute('cy',my.toFixed(1));p.moonBack.style.display=front?'none':'';}
  }

  /* sparks = new customer requests: fly in, loop once round a planet (the system that handles it), then into the door */
  var sparks=[], DOOR={x:320,y:311}, sp=$('sparks'), doorFlash=0, openSign=$('opensign');
  var T_IN=1500, T_LOOP=1500, T_HOME=1400;
  function spawn(now){
    var cands=PLANETS.filter(function(p){return p.side==='front'||Math.abs(p.x-CX)>150;});
    if(!cands.length)return;
    var p=cands[Math.floor(Math.random()*cands.length)];
    var a=Math.atan2(p.y-CY,p.x-CX)+(Math.random()-.5)*1.2;
    var g=el('g',{},sp);
    sparks.push({p:p,sx:CX+Math.cos(a)*380,sy:CY+Math.sin(a)*200,phi:a+Math.PI,t0:now,tail:[],
      trail:el('polyline',{fill:'none',stroke:'#f6e3b8','stroke-width':1.8,'stroke-linecap':'round','stroke-linejoin':'round',opacity:.5},g),
      glow:el('circle',{r:9,fill:'url(#halo)'},g),n:el('circle',{class:'spark',r:3},g),g:g});
  }
  function orbitPt(sk,ang){var R=sk.p.r*1.75*(sk.p.sc||1);return {x:sk.p.x+R*Math.cos(ang),y:sk.p.y+R*.55*Math.sin(ang)};}
  function ease(t){return t*t*(3-2*t);}
  function stepSparks(now){
    for(var i=sparks.length-1;i>=0;i--){
      var k=sparks[i], t=now-k.t0, x, y, r=3, o=1;
      if(t<T_IN){                                         // fly in to the planet
        var u=ease(t/T_IN), e=orbitPt(k,k.phi);
        x=k.sx+(e.x-k.sx)*u; y=k.sy+(e.y-k.sy)*u; o=Math.min(1,t/250); r=2+1.2*u;
      }else if(t<T_IN+T_LOOP){                            // one loop round it
        var u2=(t-T_IN)/T_LOOP, q=orbitPt(k,k.phi+u2*2*Math.PI);
        x=q.x; y=q.y; r=3.2; k.p.ping=now;
      }else if(t<T_IN+T_LOOP+T_HOME){                     // curve down into the door
        var u3=ease((t-T_IN-T_LOOP)/T_HOME), b=orbitPt(k,k.phi);
        var cx=(b.x+DOOR.x)/2, cy=Math.min(b.y,DOOR.y)-60;
        x=(1-u3)*(1-u3)*b.x+2*(1-u3)*u3*cx+u3*u3*DOOR.x; y=(1-u3)*(1-u3)*b.y+2*(1-u3)*u3*cy+u3*u3*DOOR.y;
        r=3.2-1.6*u3; o=u3>.85?1-(u3-.85)/.15:1;
      }else{k.g.remove();sparks.splice(i,1);doorFlash=now;continue;}
      k.tail.push(x.toFixed(1)+','+y.toFixed(1)); if(k.tail.length>14)k.tail.shift();
      k.n.setAttribute('cx',x.toFixed(1)); k.n.setAttribute('cy',y.toFixed(1)); k.n.setAttribute('r',r.toFixed(2));
      k.glow.setAttribute('cx',x.toFixed(1)); k.glow.setAttribute('cy',y.toFixed(1)); k.glow.setAttribute('r',(r*3.2).toFixed(1));
      k.g.style.opacity=o.toFixed(2); k.trail.setAttribute('points',k.tail.join(' '));
    }
    var f=Math.max(0,1-(now-doorFlash)/600);
    $('doorlight').style.opacity=(.75+.25*f).toFixed(2); openSign.style.filter=f>.02?'drop-shadow(0 0 '+(4*f).toFixed(1)+'px #ff8a6b)':'';
    $('glow').setAttribute('r',(180+12*f).toFixed(1));
  }

  /* loop: when a planet is in focus the whole system eases to a full stop */
  var speed=1, last=null, clock=0, nextSpark=0, running=true;
  function frame(now){
    if(!running){last=null;return;}
    if(last===null)last=now;
    var dt=Math.min(64,now-last); last=now;
    speed+=((focused?0:1)-speed)*(focused?.2:.05);
    if(focused&&speed<.002)speed=0;
    clock+=dt*speed/1000;
    PLANETS.forEach(function(p){place(p,p.phase+clock*2*Math.PI/RINGS[p.ring].period,now);});
    if(focused)placeCaption(focused);
    if(now>nextSpark&&!focused){spawn(now);nextSpark=now+1500+Math.random()*900;}
    stepSparks(now);
    requestAnimationFrame(frame);
  }
  if(reduce){
    var refresh=function(){PLANETS.forEach(function(p){p.boost=focused===p?1:0;p.dim=focused&&focused!==p?.32:1;place(p,p.phase,0);});if(focused)placeCaption(focused);};
    ['pointerover','pointerout','focusin','focusout','click'].forEach(function(ev){fig.addEventListener(ev,function(){setTimeout(refresh,0);setTimeout(refresh,400);});});
    refresh(); return;
  }
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!running){running=true;requestAnimationFrame(frame);}running=v;}).observe(fig);
  }
  document.addEventListener('visibilitychange',function(){if(document.hidden)running=false;else if(!running){running=true;requestAnimationFrame(frame);}});
  requestAnimationFrame(frame);
})();

/* full-hero starfield on a canvas, with gentle mouse parallax */
(function(){
  var hero=document.getElementById('home'), cv=document.getElementById('starfield'), ctx=cv.getContext('2d');
  var neb=document.getElementById('nebula'), orr=document.getElementById('orrery');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seed=11; function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
  // three depth layers: far stars barely move, near ones move most
  var LAYERS=[{n:260,r:[.3,.8],a:[.25,.6],par:4},{n:120,r:[.6,1.2],a:[.4,.8],par:9},{n:40,r:[1,1.8],a:[.6,1],par:16}];
  var stars=[];
  LAYERS.forEach(function(L,li){for(var i=0;i<L.n;i++)stars.push({x:rnd(),y:rnd(),r:L.r[0]+rnd()*(L.r[1]-L.r[0]),a:L.a[0]+rnd()*(L.a[1]-L.a[0]),
    tw:rnd()<.4?1.5+rnd()*3.5:0,ph:rnd()*6.28,warm:rnd()<.16,cross:li===2&&rnd()<.35,L:li});});
  var W=0,H=0,dpr=1;
  function size(){dpr=Math.min(2,window.devicePixelRatio||1);var r=hero.getBoundingClientRect();W=r.width;H=r.height;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
  size(); if('ResizeObserver' in window)new ResizeObserver(size).observe(hero); else window.addEventListener('resize',size);

  var mx=0,my=0,px=0,py=0;                       // target and smoothed pointer (-1..1)
  if(!reduce){
    hero.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;var r=hero.getBoundingClientRect();mx=((e.clientX-r.left)/r.width-.5)*2;my=((e.clientY-r.top)/r.height-.5)*2;});
    hero.addEventListener('pointerleave',function(){mx=0;my=0;});
  }
  var met=null, metNext=performance.now()+2500;
  function draw(now){
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<stars.length;i++){
      var s=stars[i], par=LAYERS[s.L].par;
      var x=s.x*W-px*par, y=s.y*H-py*par;
      var a=s.a*(s.tw&&!reduce?(.55+.45*Math.sin(now/1000*s.tw+s.ph)):1);
      ctx.globalAlpha=a; ctx.fillStyle=s.warm?'#f1dcae':'#f4f8ef';
      ctx.beginPath(); ctx.arc(x,y,s.r,0,6.2832); ctx.fill();
      if(s.cross){ctx.globalAlpha=a*.45;ctx.fillRect(x-4,y-.3,8,.6);ctx.fillRect(x-.3,y-4,.6,8);}
    }
    if(!reduce){
      if(!met&&now>metNext)met={x:rnd()*W*.7,y:rnd()*H*.35,t0:now,len:60+rnd()*50};
      if(met){var t=(now-met.t0)/950;
        if(t>=1){met=null;metNext=now+5000+rnd()*7000;}
        else{var hx=met.x+t*W*.28, hy=met.y+t*W*.12, L=met.len*Math.sin(Math.PI*t), g=ctx.createLinearGradient(hx-L*.92,hy-L*.39,hx,hy);
          g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,.9)');
          ctx.globalAlpha=Math.sin(Math.PI*t);ctx.strokeStyle=g;ctx.lineWidth=1.6;ctx.lineCap='round';
          ctx.beginPath();ctx.moveTo(hx-L*.92,hy-L*.39);ctx.lineTo(hx,hy);ctx.stroke();}}
    }
    ctx.globalAlpha=1;
  }
  var running=true;
  function frame(now){
    if(!running)return;
    px+=(mx-px)*.05; py+=(my-py)*.05;
    neb.style.transform='translate('+(-px*6).toFixed(2)+'px,'+(-py*6).toFixed(2)+'px)';
    orr.style.transform='translate('+(px*3).toFixed(2)+'px,'+(py*2).toFixed(2)+'px)';
    draw(now); requestAnimationFrame(frame);
  }
  if(reduce){draw(0);window.addEventListener('resize',function(){draw(0);});return;}
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!running){running=true;requestAnimationFrame(frame);}running=v;}).observe(hero);
  document.addEventListener('visibilitychange',function(){if(document.hidden)running=false;else if(!running){running=true;requestAnimationFrame(frame);}});
  requestAnimationFrame(frame);
})();
