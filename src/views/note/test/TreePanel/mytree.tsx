import React, { useState, useEffect } from 'react';

import { useMantineTheme, Button, ActionIcon } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import {
  IconFolderPlus,
  IconFolderMinus,
  IconCaretRightFilled,
  IconCaretDownFilled,
  IconFile,
  IconTrash,
  IconPlus,
} from '@tabler/icons-react';
import TreeModel from "tree-model-improved";

const treedata = [
  {
    id: 1,
    name: 'Root',
    type: 'folder',
    children: [
      {
        id: 2,
        name: 'Documents',
        type: 'folder',
        children: [
          {
            id: 21,
            name: 'Project Reports',
            type: 'folder',
            children: [
              {
                id: 212,
                name: 'Q1 Report.pdf',
                type: 'file',
              },
              {
                id: 213,
                name: 'Q2 Report.pdf',
                type: 'file',
              },
            ],
          },
          {
            id: 22,
            name: 'Invoices',
            type: 'folder',
            children: [
              {
                id: 221,
                name: 'Invoice-001.pdf',
                type: 'file',
              },
              {
                id: 222,
                name: 'Invoice-002.pdf',
                type: 'file',
              },
            ],
          },
        ],
      },
      {
        id: 3,
        name: 'Photos',
        type: 'folder',
        children: [
          {
            id: 31,
            name: 'Vacation',
            type: 'folder',
            children: [
              {
                id: 311,
                name: 'Beach.jpg',
                type: 'file',
              },
              {
                id: 312,
                name: 'Mountain.jpg',
                type: 'file',
              },
            ],
          },
          {
            id: 32,
            name: 'Family',
            type: 'folder',
            children: [
              {
                id: 321,
                name: 'Family Portrait.jpg',
                type: 'file',
              },
            ],
          },
          {
            id: 322,
            name: 'Friends',
            type: 'folder',
            children: [
              {
                id: 1,
                name: 'Party.jpg',
                type: 'file',
              },
            ],
          },
        ],
      },
      {
        id: 4,
        name: 'Work',
        type: 'folder',
        children: [
          {
            id: 41,
            name: 'Projects',
            type: 'folder',
            children: [
              {
                id: 411,
                name: 'Project A',
                type: 'folder',
                children: [
                  {
                    id: 4111,
                    name: 'Design',
                    type: 'folder',
                    children: [
                      {
                        id: 41111,
                        name: 'Sketches',
                        type: 'folder',
                        children: [
                          {
                            id: 411111,
                            name: 'Sketch 1.jpg',
                            type: 'file',
                          },
                          {
                            id: 411112,
                            name: 'Sketch 2.jpg',
                            type: 'file',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    id: 4112,
                    name: 'Documentation',
                    type: 'folder',
                    children: [
                      {
                        id: 41121,
                        name: 'User Manual.pdf',
                        type: 'file',
                      },
                      {
                        id: 41122,
                        name: 'Technical Specs.pdf',
                        type: 'file',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 42,
            name: 'Reports',
            type: 'folder',
            children: [
              {
                id: 421,
                name: 'Monthly Reports',
                type: 'folder',
                children: [
                  {
                    id: 422,
                    name: 'January.pdf',
                    type: 'file',
                  },
                  {
                    id: 423,
                    name: 'February.pdf',
                    type: 'file',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

function Node({ node, depth, showChild, expandAll, handleAdd, handleRemove }) {
  const theme = useMantineTheme();
  const [showChildren, setShowChildren] = useState(true);

  const { hovered, ref } = useHover();

  useEffect(() => {
    setShowChildren(expandAll);
  }, [expandAll]);

  let displayValue = showChild ? 'block' : 'none';
  return (
    <div>
      <div
        style={{
          marginLeft: `${depth + 15}px`,
          display: depth > 0 ? displayValue : 'block',
          marginTop: '10px',
          //width: `calc(100% - ${depth + 15}px)`,
        }}
      >
        <div
          ref={ref}
          style={{
            padding: '5px 5px',
            cursor: 'pointer',
            userSelect: 'none',
            background: hovered ? theme.colors.gray[2] : theme.colors.gray[1],
            //borderRadius: '15px',
          }}
          onClick={() => {
            setShowChildren(!showChildren);
          }}
        >
          {node.type === 'folder' ? (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  padding: '.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  justifyContent: 'space-between',
                }}
              >
                {!showChildren ? (
                  <>
                    <IconCaretRightFilled
                      size={'1rem'}
                      onClick={() => {
                        setShowChildren(!showChildren);
                      }}
                    />
                    <IconFolderPlus
                      size={'1rem'}
                      color={theme.colors.blue[6]}
                    />
                  </>
                ) : (
                  <>
                    <IconCaretDownFilled
                      size={'1rem'}
                      onClick={() => {
                        setShowChildren(!showChildren);
                      }}
                    />
                    <IconFolderMinus
                      size={'1rem'}
                      color={theme.colors.blue[6]}
                    />
                  </>
                )}

                <span>{`${node.name}`}</span>
              </span>

              <div style={{ display: hovered ? 'flex' : 'none' }}>
                <ActionIcon color="green">
                  <IconPlus
                    size="1rem"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(node);
                    }}
                  />
                </ActionIcon>
                <ActionIcon color="gray">
                  <IconTrash
                    size="1rem"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(node);
                    }}
                  />
                </ActionIcon>
              </div>
            </span>
          ) : (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '.3rem',
                }}
              >
                <IconFile size={'1rem'} color={theme.colors.green[4]} />
                <span>{node.name}</span>
              </span>

              <div style={{ display: hovered ? 'flex' : 'none' }}>
                <ActionIcon color="gray">
                  <IconTrash
                    size="1rem"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(node);
                    }}
                  />
                </ActionIcon>
              </div>
            </span>
          )}
        </div>
        {node.children &&
          node.children.map((ch) => (
            <Node
              node={ch}
              depth={depth + 10}
              showChild={showChildren}
              expandAll={expandAll}
              handleAdd={handleAdd}
              handleRemove={handleRemove}
            />
          ))}
      </div>
    </div>
  );
}

export default function Mytree() {
  const [expandAll, setExpandAll] = useState(false);
  const [structure, setStructure] = useState(treedata);

  function handleRemove(node) {
    console.log('deleted', node);

  }
	function findById(node: any, id: string) {
		return node.first((n: any) => n.id === id);
	}
  function handleAdd(node) {


    console.log('added', node);
  }

  return (
    <div>
      {structure.length > 0 ? (
        <div style={{ paddingRight: '10px' }}>
          <Button
            radius="xs"
            size="xs"
            uppercase
            onClick={() => setExpandAll(!expandAll)}
          >
            {expandAll ? 'Collapse All' : 'Expand All'}
          </Button>
          <Node
            node={structure[0]}
            depth={0}
            showChild={true}
            expandAll={expandAll}
            handleRemove={handleRemove}
            handleAdd={handleAdd}
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
