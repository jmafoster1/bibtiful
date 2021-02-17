'use babel';

import { CompositeDisposable } from 'atom';
const bibtexParse = require('bibtex-parse');

export default {

  bibtifulView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that bibtifys this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'bibtiful:bibtify': () => this.bibtify()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  bibtify() {
    const editor = atom.workspace.getActiveTextEditor();
    const entries = bibtexParse.parse(editor.getText()).filter(entry => entry.itemtype == "entry");
    entries.sort((a, b) => (a.key > b.key) ? 1 : -1);

    if (entries.length > 0) {
      const entryStrings = []

      for (const i in entries) {
        const entry = entries[i];
        entry.fields.sort((a, b) => (a.name > b.name) ? 1 : -1);

        const entryString = [];
        for (k in entry.fields) {
          const key = entry.fields[k];
          entryString.push(`  ${key.name.toLowerCase()} = {${key.value}}`);
        }

        entryStrings.push(`@${entry.type}{${entry.key},\n${entryString.join(",\n")}\n}`);
      }
      if (editor) {
        editor.setText(entryStrings.join("\n\n"));
        editor.save();
      }
    }
  }

};
