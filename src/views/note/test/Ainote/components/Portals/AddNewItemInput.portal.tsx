import type { Folder } from '../../FileTreeContext/Ctx.type'
import type { ElementRef } from 'react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { If } from 'classic-react-components'
import {useContextActions, useStateSelector } from '../../FileTreeContext/useTreeCtxState'
import { useEventListener } from '../../hooks/useEventListener'
import AppLi from '../AppComponents/AppLi'
import { FileIcon } from '../FileTree/TreeFile/TreeFile'
import AppInput from '../AppComponents/AppInput'
import { FolderIcon } from '../FileTree/TreeFolder/TreeFolder'
import AppButton from '../AppComponents/AppButton'


export default function AddNewItem__Portal() {
   const focusedNode = useStateSelector((state) => state.FocusedNode.item)
   const treeContainerRef = useStateSelector((state) => state.FilesListRef, false)
   const focusedNodeTarget = useStateSelector((state) => state.FocusedNode.target)
   const isExpanded = useStateSelector((state) => state.TreeExpandState.get(focusedNode?.id ?? ''))
   const shouldShowFolderInput = useStateSelector((state) => state.shouldShowFolderInput)
   const shouldShowFileInput = useStateSelector((state) => state.shouldShowFileInput)

   const [portalContainer, setPortalContainer] = useState<HTMLElement | null | undefined>(null)
   const portalParentElement = (focusedNodeTarget as HTMLButtonElement)?.parentElement
   const fileInputRef = useRef<HTMLInputElement>(null)
   const folderInputRef = useRef<HTMLInputElement>(null)

   const { createFile, createFolder, hideAllInputs } = useContextActions()

   useEffect(() => {
      // checking item type is folder or not
      if (focusedNode?.isFolder && isExpanded && portalParentElement) {
         setPortalContainer(portalParentElement.querySelector('ul'))
         return
      }
      // item is not folder then get it's parent element
      if (focusedNode && !focusedNode.isFolder) {
         setPortalContainer(portalParentElement?.parentElement?.parentElement?.querySelector('ul'))
      } else {
         // if none, then set it to root container
         setPortalContainer(treeContainerRef.current)
      }
   }, [isExpanded])

   if (!portalContainer) return null

   const PortalElement = () => {
      const parent: Folder = useStateSelector(
         (state) => state.Files.get(state.Files.get(focusedNode?.id ?? '')?.parentId ?? '') as Folder,
         false
      )
      const Files = useStateSelector((state) => state.Files, false)
      const [error, setError] = useState<string | null>(null)
      const [newName, setName] = useState('')
      const elementRef = useRef<ElementRef<'li'>>(null)


      const handleChange = (value: string) => {
         setName(value)
         setError(null)
         if (!value) {
            setError('Pls input file name')
            return
         }
         // run loop for the children
         parent.childrenIds.forEach((id) => {
            if (value == Files.get(id)?.name) {
               setError('File already exists')
               return
            }
         })
      }

      const handleSaveItem = () => {
         if (error) {
            hideAllInputs()
            return
         }
         if (shouldShowFileInput) {
            createFile({ name: newName })
         }
         if (shouldShowFolderInput) {
            createFolder({ name: newName })
         }
         hideAllInputs()
      }

      // save when clicked any where in tree-container
      useEventListener(treeContainerRef.current, 'click', (e) => {
         if (elementRef.current?.contains(e.target as Node)) return

         // if space key pressed and inputElement is focused then don't trigger save event
         if (shouldShowFileInput && document.activeElement == fileInputRef.current) return
         if (shouldShowFolderInput && document.activeElement == folderInputRef.current) return

         handleSaveItem()
      })

      // we can also use treeContainerRef.current instead of document
      useEventListener(document, 'keydown', (e) => {
         if (e.key != 'Escape') return
         handleSaveItem()
      })

      // save on contexmenu
      useEventListener(treeContainerRef.current, 'contextmenu', () => {
         handleSaveItem()
      })

      return (
         <AppLi className={`${focusedNode?.id == 'root' || !focusedNode?.isFolder ? '' : 'pl-4'}`} liRef={elementRef}>
            <form
               onSubmit={(e) => {
                  e.preventDefault()
                  if (error) return
                  handleSaveItem()
               }}
               className='w-auto py-1 relative'
            >
               <div className={`flex items-center ${shouldShowFileInput ? '' : 'hidden'}`}>
                  <FileIcon className='mr-2 shrink-0' />
                  <AppInput
                     className='z-10 p-1 h-8 outline-none focus:border leading-5 w-full'
                     placeholder='new file'
                     inputRef={fileInputRef}
                     onChange={(e) => handleChange(e.target.value)}
                     autoFocus
                  />
               </div>
               <div className={`flex items-center ${shouldShowFolderInput ? '' : 'hidden'}`}>
                  <FolderIcon className='mr-2 shrink-0' />
                  <AppInput
                     className='z-10 p-1 h-8 outline-none focus:border leading-5 w-full'
                     placeholder='new folder'
                     inputRef={folderInputRef}
                     onChange={(e) => handleChange(e.target.value)}
                     autoFocus
                  />
               </div>
               <If condition={error}>
                  <span className='absolute w-full mt-1 top-full left-0 bg-red-500 text-black'>{error}</span>
               </If>

               <AppButton type="submit" className='invisible hidden'></AppButton>
            </form>
         </AppLi>
      )
   }

   return createPortal(<PortalElement />, portalContainer)
}
