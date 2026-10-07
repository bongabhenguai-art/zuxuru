import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from './chatgpt-auth';
import Appfront from './appfront';
export const dynamic='force-dynamic';
export default async function Home() {
 const user=await getChatGPTUser();
 return <Appfront signedIn={Boolean(user)} signInHref={chatGPTSignInPath('/')} signOutHref={chatGPTSignOutPath('/')} />;
}
