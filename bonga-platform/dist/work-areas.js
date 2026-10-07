'use strict';
document.querySelectorAll('[data-work-filter]').forEach(link=>link.addEventListener('click',()=>{
 const filter=link.dataset.workFilter;
 const target=document.querySelector('.module-filter[data-filter="'+filter+'"]');
 if(target){target.click();document.querySelectorAll('[data-work-filter]').forEach(a=>a.classList.toggle('selected',a===link));}
 else{const status=document.getElementById('route-status');if(status)status.textContent='Work areas are still loading. Try again after the module definitions load.';}
}));
