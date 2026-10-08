(()=>{
  const root=document.getElementById('workspace-layer');if(!root)return;
  const tabs=[...root.querySelectorAll('[role="tab"]')],panels=[...root.querySelectorAll('[role="tabpanel"]')];
  function select(index,focus=false){
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    panels.forEach((panel,i)=>panel.hidden=i>index);
    if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>select(index));
    tab.addEventListener('keydown',event=>{
      let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
      event.preventDefault();select(next,true);
    });
  });
  select(0);
  document.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-workspace-brief]');if(!trigger)return;
    const goal=document.getElementById('brief-goal');goal.value=trigger.dataset.workspaceBrief.slice(0,2000);
  });
})();
