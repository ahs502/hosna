import { webConfig } from '../../../modules/webConfig'
import { getVersion } from './getVersion'

export function printWelcomeMessage(): void {
  console.log(messages[Math.floor(Math.random() * messages.length)])
}

const messages: readonly string[] = [
  `
                                    _   _          _          
                                   | | (_)        | |         
  _ __ ___     __ _  __  __   ___  | |  _    ___  | | __  ___ 
 | '_ \` _ \\   / _\` | \\ \\/ /  / __| | | | |  / __| | |/ / / __|
 | | | | | | | (_| |  >  <  | (__  | | | | | (__  |   <  \\__ \\
 |_| |_| |_|  \\__,_| /_/\\_\\  \\___| |_| |_|  \\___| |_|\\_\\ |___/
      _   _   _   _   _   _   _   _                           
  /| | | | | | | | | | | | | | | | )  \u24D2 2025 ${webConfig.app.name}
 (_| |_| |_| |_| |_| |_| |_| |_| |/   \u24E5 ${getVersion()}
                                                              
`,
  `
                                         888 d8b          888               
                                         888 Y8P          888               
                                         888              888               
88888b.d88b.   8888b.  888  888  .d8888b 888 888  .d8888b 888  888 .d8888b  
888 "888 "88b     "88b \`Y8bd8P' d88P"    888 888 d88P"    888 .88P 88K      
888  888  888 .d888888   X88K   888      888 888 888      888888K  "Y8888b. 
888  888  888 888  888 .d8""8b. Y88b.    888 888 Y88b.    888 "88b      X88 
888  888  888 "Y888888 888  888  "Y8888P 888 888  "Y8888P 888  888  88888P' 
                                                                            
d8b  d8b  d8b  d8b  d8b  d8b  d8b  d8b  d8b  d8b   \u24D2 2025 ${webConfig.app.name}
Y8P  Y8P  Y8P  Y8P  Y8P  Y8P  Y8P  Y8P  Y8P  Y8P   \u24E5 ${getVersion()}
                                                                            
`,
]
