(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const f of o)if(f.type==="childList")for(const S of f.addedNodes)S.tagName==="LINK"&&S.rel==="modulepreload"&&r(S)}).observe(document,{childList:!0,subtree:!0});function e(o){const f={};return o.integrity&&(f.integrity=o.integrity),o.referrerPolicy&&(f.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?f.credentials="include":o.crossOrigin==="anonymous"?f.credentials="omit":f.credentials="same-origin",f}function r(o){if(o.ep)return;o.ep=!0;const f=e(o);fetch(o.href,f)}})();function l(i,t){return Math.floor(Math.random()*(t-i+1)+i)}function y(){throw new Error("Cycle detected")}var $=Symbol.for("preact-signals");function x(){if(v>1)v--;else{for(var i,t=!1;a!==void 0;){var e=a;for(a=void 0,w++;e!==void 0;){var r=e.o;if(e.o=void 0,e.f&=-3,!(8&e.f)&&L(e))try{e.c()}catch(o){t||(i=o,t=!0)}e=r}}if(w=0,v--,t)throw i}}var n=void 0,a=void 0,v=0,w=0,p=0;function E(i){if(n!==void 0){var t=i.n;if(t===void 0||t.t!==n)return t={i:0,S:i,p:n.s,n:void 0,t:n,e:void 0,x:void 0,r:t},n.s!==void 0&&(n.s.n=t),n.s=t,i.n=t,32&n.f&&i.S(t),t;if(t.i===-1)return t.i=0,t.n!==void 0&&(t.n.p=t.p,t.p!==void 0&&(t.p.n=t.n),t.p=n.s,t.n=void 0,n.s.n=t,n.s=t),t}}function s(i){this.v=i,this.i=0,this.n=void 0,this.t=void 0}s.prototype.brand=$;s.prototype.h=function(){return!0};s.prototype.S=function(i){this.t!==i&&i.e===void 0&&(i.x=this.t,this.t!==void 0&&(this.t.e=i),this.t=i)};s.prototype.U=function(i){if(this.t!==void 0){var t=i.e,e=i.x;t!==void 0&&(t.x=e,i.e=void 0),e!==void 0&&(e.e=t,i.x=void 0),i===this.t&&(this.t=e)}};s.prototype.subscribe=function(i){var t=this;return U(function(){var e=t.value,r=32&this.f;this.f&=-33;try{i(e)}finally{this.f|=r}})};s.prototype.valueOf=function(){return this.value};s.prototype.toString=function(){return this.value+""};s.prototype.toJSON=function(){return this.value};s.prototype.peek=function(){return this.v};Object.defineProperty(s.prototype,"value",{get:function(){var i=E(this);return i!==void 0&&(i.i=this.i),this.v},set:function(i){if(n instanceof h&&function(){throw new Error("Computed cannot have side-effects")}(),i!==this.v){w>100&&y(),this.v=i,this.i++,p++,v++;try{for(var t=this.t;t!==void 0;t=t.x)t.t.N()}finally{x()}}}});function b(i){return new s(i)}function L(i){for(var t=i.s;t!==void 0;t=t.n)if(t.S.i!==t.i||!t.S.h()||t.S.i!==t.i)return!0;return!1}function N(i){for(var t=i.s;t!==void 0;t=t.n){var e=t.S.n;if(e!==void 0&&(t.r=e),t.S.n=t,t.i=-1,t.n===void 0){i.s=t;break}}}function P(i){for(var t=i.s,e=void 0;t!==void 0;){var r=t.p;t.i===-1?(t.S.U(t),r!==void 0&&(r.n=t.n),t.n!==void 0&&(t.n.p=r)):e=t,t.S.n=t.r,t.r!==void 0&&(t.r=void 0),t=r}i.s=e}function h(i){s.call(this,void 0),this.x=i,this.s=void 0,this.g=p-1,this.f=4}(h.prototype=new s).h=function(){if(this.f&=-3,1&this.f)return!1;if((36&this.f)==32||(this.f&=-5,this.g===p))return!0;if(this.g=p,this.f|=1,this.i>0&&!L(this))return this.f&=-2,!0;var i=n;try{N(this),n=this;var t=this.x();(16&this.f||this.v!==t||this.i===0)&&(this.v=t,this.f&=-17,this.i++)}catch(e){this.v=e,this.f|=16,this.i++}return n=i,P(this),this.f&=-2,!0};h.prototype.S=function(i){if(this.t===void 0){this.f|=36;for(var t=this.s;t!==void 0;t=t.n)t.S.S(t)}s.prototype.S.call(this,i)};h.prototype.U=function(i){if(this.t!==void 0&&(s.prototype.U.call(this,i),this.t===void 0)){this.f&=-33;for(var t=this.s;t!==void 0;t=t.n)t.S.U(t)}};h.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(var i=this.t;i!==void 0;i=i.x)i.t.N()}};h.prototype.peek=function(){if(this.h()||y(),16&this.f)throw this.v;return this.v};Object.defineProperty(h.prototype,"value",{get:function(){1&this.f&&y();var i=E(this);if(this.h(),i!==void 0&&(i.i=this.i),16&this.f)throw this.v;return this.v}});function q(i){return new h(i)}function I(i){var t=i.u;if(i.u=void 0,typeof t=="function"){v++;var e=n;n=void 0;try{t()}catch(r){throw i.f&=-2,i.f|=8,O(i),r}finally{n=e,x()}}}function O(i){for(var t=i.s;t!==void 0;t=t.n)t.S.U(t);i.x=void 0,i.s=void 0,I(i)}function A(i){if(n!==this)throw new Error("Out-of-order effect");P(this),n=i,this.f&=-2,8&this.f&&O(this),x()}function d(i){this.x=i,this.u=void 0,this.s=void 0,this.o=void 0,this.f=32}d.prototype.c=function(){var i=this.S();try{if(8&this.f||this.x===void 0)return;var t=this.x();typeof t=="function"&&(this.u=t)}finally{i()}};d.prototype.S=function(){1&this.f&&y(),this.f|=1,this.f&=-9,I(this),N(this),v++;var i=n;return n=this,A.bind(this,i)};d.prototype.N=function(){2&this.f||(this.f|=2,this.o=a,a=this)};d.prototype.d=function(){this.f|=8,1&this.f||O(this)};function U(i){var t=new d(i);try{t.c()}catch(e){throw t.d(),e}return t.d.bind(t)}const u=b(1),C=b(!1),M=q(()=>u.value*10);let c=b(l(1,9)),T=q(()=>u.value*c.value);document.querySelector("#app").innerHTML=`
  <div>
    <h1>Signals in Vanilla JS</h1>
    <div class="card">
      <button type="button" id="incrementCounter">count is <span class="counter">${u.value}</span></button>
      <button type="reset" id="reset">Reset</button>
    </div>
    <p>Result: <span class="counter">${u.value}</span> * 10 = <span class="result">10</span></p>
    <h1>
      <span class="counter">${u.value}</span> * <span class="randomSeed">${c.value}</span> = <span class="randomizedResult">${T}</span>.
    </h1>
  </div>
`;function R(){const i=document.querySelectorAll(".counter"),t=document.querySelector(".result"),e=document.querySelectorAll(".randomSeed"),r=document.querySelectorAll(".randomizedResult");!(i!=null&&i.length)||!t||!(e!=null&&e.length)||!(r!=null&&r.length)||(i.forEach(o=>{o.innerText=u.value.toString()}),t.innerText=M.value.toString(),e.forEach(o=>{o.innerText=c.value.toString()}),r.forEach(o=>{o.innerText=T.value.toString()}))}const m=document.getElementById("incrementCounter"),g=document.getElementById("reset");m==null||m.addEventListener("click",()=>{u.value++});g==null||g.addEventListener("click",()=>{u.value=0,c.value=l(1,99),console.info({new:c.value}),C.value=!0});U(R);setInterval(()=>{C.value===!1&&(u.value=l(1,9),c.value=l(1,9),console.info({counter:u.value}),console.info({randomSeed:c.value}))},5e3);
