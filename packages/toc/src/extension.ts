// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  ILayoutRestorer,
  JupyterLab,
  JupyterLabPlugin,
} from '@jupyterlab/application';

import {IDocumentManager} from '@jupyterlab/docmanager';

import {IEditorTracker} from '@jupyterlab/fileeditor';

import {INotebookTracker} from '@jupyterlab/notebook';

import {TableOfContents} from './toc';

import {createNotebookGenerator, createMarkdownGenerator} from './generators';

import {ITableOfContentsRegistry, TableOfContentsRegistry} from './registry';

import '../style/index.css';

/**
 * Initialization data for the jupyterlab-toc extension.
 */
const extension: JupyterLabPlugin<ITableOfContentsRegistry> = {
  id: 'jupyterlab-toc',
  autoStart: true,
  provides: ITableOfContentsRegistry,
  requires: [
    IDocumentManager,
    IEditorTracker,
    ILayoutRestorer,
    INotebookTracker,
  ],
  activate: activateTOC,
};

/**
 * Activate the ToC extension.
 */
function activateTOC(
  app: JupyterLab,
  docmanager: IDocumentManager,
  editorTracker: IEditorTracker,
  restorer: ILayoutRestorer,
  notebookTracker: INotebookTracker,
): ITableOfContentsRegistry {
  // Create the ToC widget.
  const toc = new TableOfContents(docmanager);

  // Create the ToC registry.
  const registry = new TableOfContentsRegistry();

  // Add the ToC to the left area.
  toc.title.label = 'Contents';
  toc.id = 'table-of-contents';
  app.shell.addToLeftArea(toc, {rank: 700});

  // Add the ToC widget to the application restorer.
  restorer.add(toc, 'juputerlab-toc');

  // Create a notebook TableOfContentsRegistry.IGenerator
  const notebookGenerator = createNotebookGenerator(notebookTracker);

  // Create an markdown editor TableOfContentsRegistry.IGenerator
  const markdownGenerator = createMarkdownGenerator(editorTracker);

  registry.addGenerator(notebookGenerator);
  registry.addGenerator(markdownGenerator);

  // Change the ToC when the active widget changes.
  app.shell.currentChanged.connect(() => {
    let widget = app.shell.currentWidget;
    if (!widget) {
      return;
    }
    let generator = registry.findGeneratorForWidget(widget);
    if (!generator) {
      return;
    }
    toc.current = {widget, generator};
  });

  return registry;
}

export default extension;
