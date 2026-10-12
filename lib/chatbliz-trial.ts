// Trial eligibility must be evaluated server-side for the authenticated tenant.
// One 30-day trial per owner, regardless of selected package. No automatic paid conversion.
export const TRIAL_DAYS=30;
export function trialEndsAt(startedAt:string){const d=new Date(startedAt);if(Number.isNaN(d.getTime()))throw Error('Invalid trial start');d.setUTCDate(d.getUTCDate()+TRIAL_DAYS);return d.toISOString()}
export function trialStatus(startedAt:string,now=Date.now()){const end=trialEndsAt(startedAt);return {trialEndsAt:end,trialActive:now<Date.parse(end),daysRemaining:Math.max(0,Math.ceil((Date.parse(end)-now)/86400000))}}
