import { ElementRef, useRef } from 'react'
import { flushSync } from 'react-dom'
import { If } from 'classic-react-components'
import {useContextActions, useContextDispatch, useStateSelector} from "~/views/note/Ainote/FileTreeContext/useTreeCtxState";
import {useEventListener} from "~/views/note/Ainote/hooks/useEventListener";
import AppInput from '../AppComponents/AppInput'
import AppContextMenu from "~/views/note/Ainote/components/AppComponents/AppContextMenu";
import AppLi from '../AppComponents/AppLi';
import useKeyEventListener from '../../hooks/useKeyEventListener';


export default function TreeContextMenu() {
   const ctxMenuRef = useRef<ElementRef<'div'>>(null)
   const focusedNode = useStateSelector((state) => state.FocusedNode.item)
   const Files = useStateSelector((state) => state.Files, false)
   const shouldShowTreeContextMenu = useStateSelector((state) => state.showTreeContextMenu)
   const treeContainerRef = useStateSelector((state) => state.FilesListRef, false)
   const { deleteFile, deleteFolder, expandFolder, toggleFolderInputVisibility, toggleFileInputVisibility } = useContextActions()
   const dispatch = useContextDispatch()

   const closeContextMenu = () => {
      dispatch((state) => {
         state.showTreeContextMenu = false
         return state
      })
   }
   const handleRename = () => {
      dispatch((state) => {
         const itemId = focusedNode?.id ?? ''
         const item = state.Files.get(itemId)
         if (item) {
            item.isRenaming = true
         }
         state.shouldShowFileInput = true
         state.isRenamingItem = true
         return state
      })
      closeContextMenu()
   }

   useEventListener(treeContainerRef.current, 'contextmenu', (e) => {
      e.preventDefault()

      flushSync(() => {
         dispatch((state) => {
            const item = state.Files.get((e.target as HTMLButtonElement).getAttribute('data-id')!)

            if (!item) {
               state.HighlightedNode.id = 'root'
               state.FocusedNode = {
                  item: state.Files.get('root')!,
                  target: document.querySelector('button[data-id=root]'),
               }
            } else {
               state.HighlightedNode.id = item.id
               state.FocusedNode.item = item
               state.FocusedNode.target = e.target
            }
            state.showTreeContextMenu = true
            return state
         })
      })

      const menu = ctxMenuRef.current
      if (!menu) return
      const menuHeight = menu.clientHeight ?? 70
      const extraHeight = 20
      let left = e.clientX + 5
      let top = e.clientY

      // to prevent going outside of the tree-container
      if (window.innerWidth - e.clientX < 100) {
         left = window.innerWidth - 100
      }
      // to prevent going outside of the tree-container
      if (window.innerHeight - e.clientY < menuHeight) {
         top = window.innerHeight - menuHeight - extraHeight
      }

      menu.style.left = left + 'px'
      menu.style.top = top + 'px'
   })


   useKeyEventListener(
      'keydown',
      ['Delete'],
      (e) => {
         const id = (e.target as HTMLElement).getAttribute('data-id')
         if (!id) return

         const isFolder = Files.get(id)?.isFolder
         if (isFolder) return deleteFolder(id)

         deleteFile(id)
      },
      { shouldAddEvent: true }
   )

   useKeyEventListener(
      'keydown',
      ['F2'],
      () => {
         handleRename()
         expandFolder(focusedNode?.id)
      },
      { shouldAddEvent: true, preventDefault: true }
   )

   return (
      <>
         <If condition={shouldShowTreeContextMenu}>
            <AppContextMenu
               containerClassName='w-64 rounded-sm border border-gray-700 fixed left-10 bg-slate-800 z-10'
               contextMenuRef={ctxMenuRef}
               onClose={closeContextMenu}
            >
                  {focusedNode?.isFolder && (
                     <>
                        <AppLi
                           className='cursor-pointer p-1 border border-x-0 border-t-0 border-gray-700 hover:bg-purple-700'
                           onClick={() => {
                              toggleFileInputVisibility()
                              closeContextMenu()
                           }}
                        >
                           <span>New File</span>
                        </AppLi>
                        <AppLi
                           className='cursor-pointer p-1 border border-x-0 border-t-0 border-gray-700 hover:bg-purple-700'
                           onClick={() => {
                              toggleFolderInputVisibility()
                              closeContextMenu()
                           }}
                        >
                           <span>New Folder</span>
                        </AppLi>
                        {focusedNode.id != 'root' && (
                           <>
                              <AppLi
                                 className='cursor-pointer p-1 border border-x-0 border-t-0 border-gray-700 hover:bg-purple-700 flex justify-between'
                                 onClick={handleRename}
                              >
                                 <span>Rename</span>
                                 <span>F2</span>
                              </AppLi>
                              <AppLi
                                 className='cursor-pointer p-1 border border-x-0 border-t-0 border-gray-700 hover:bg-purple-700 flex justify-between'
                                 onClick={() => {
                                    deleteFolder(focusedNode.id)
                                    closeContextMenu()
                                 }}
                              >
                                 <span>Delete</span>
                                 <span>del</span>
                              </AppLi>
                           </>
                        )}
                     </>
                  )}
                  {!focusedNode?.isFolder && (
                     <>
                        <AppLi
                           className='cursor-pointer p-1 border border-x-0 border-t-0 border-gray-700 hover:bg-purple-700 flex justify-between'
                           onClick={handleRename}
                        >
                           <span>Rename</span>
                           <span>F2</span>
                        </AppLi>
                        <AppLi
                           className='cursor-pointer p-1 border border-x-0 border-t-0 border-gray-700 hover:bg-purple-700 flex justify-between'
                           onClick={() => {
                              focusedNode && deleteFile(focusedNode.id)
                              closeContextMenu()
                           }}
                        >
                           <span>Delete</span>
                           <span>del</span>
                        </AppLi>
                     </>
                  )}
            </AppContextMenu>
         </If>
      </>
   )
}
