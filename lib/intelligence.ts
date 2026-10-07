import {get,save,validatedProfile} from './zuxuru';
import {businessIntelligence} from './intelligence-view';
export {businessIntelligence,prioritize,intelligenceVersion} from './intelligence-view';
export async function analyzeBusiness(owner:string,id:string){
 const p=validatedProfile(await get(owner,'profile',id));if(!p.identityConfirmed)throw Error('Confirm business identity before intelligence analysis.');
 const result=await save(owner,'intelligence',businessIntelligence(p));
 await save(owner,'history',{profileId:id,action:'Evidence intelligence reviewed',actor:'Deterministic evidence rules',intelligenceId:result.id});return result;
}
