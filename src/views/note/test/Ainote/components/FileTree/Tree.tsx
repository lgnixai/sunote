import type { File, Folder } from '../../FileTreeContext/Ctx.type'
import { Else, If, Then } from 'classic-react-components'

import TreeFile from './TreeFile/TreeFile'
import TreeFolder from './TreeFolder/TreeFolder'
import AppLi from "~/views/note/Ainote/components/AppComponents/AppLi";
import { cn } from '../../lib/cn-merge';

export default function Tree({ item }: { item: File | Folder }) {
   if (!item) return null
   return (
      <>
         <AppLi className={cn('px-0 py-0', item.parentId != 'root' ? 'pl-4' : '')}>
            <If condition={item.isFolder}>
               <Then>
                  <TreeFolder folder={item as Folder} />
               </Then>
               <Else>
                  <TreeFile file={item} />
               </Else>
            </If>
         </AppLi>
      </>
   )
}
