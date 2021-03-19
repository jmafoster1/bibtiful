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
      'bibtiful:bibtify': () => this.bibtify(),
      'bibtiful:standardiseKeys': () => this.standardiseKeys()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  standardiseKeys() {
    const editor = atom.workspace.getActiveTextEditor();
    const entries = bibtexParse.parse(editor.getText()).filter(entry => entry.itemtype == "entry");

    if (entries.length > 0) {
      var entryStrings = []
      var keys = []

      for (const i in entries) {
        const entry = entries[i];

        entry.fields.sort((a, b) => (a.name > b.name) ? 1 : -1);

        const entryString = [];
        var newKey = null;

        for (k in entry.fields) {
          const key = entry.fields[k];
          entryString.push(`  ${key.name.toLowerCase()} = {${key.value}}`);


          if (key.name == "author") {
            const firstAuthor = key.value.split("and")[0].trim();
            if (firstAuthor.includes(",")) {
              newKey = firstAuthor.split(",")[0];
            }
            else {
              const tmp = firstAuthor.split(" ");
              newKey = tmp[tmp.length -1];
            }
            newKey = newKey.normalize("NFD").replace(/[^0-9a-z]/gi, '').toLowerCase();
          }
          if (newKey && key.name == "year") {
            newKey += key.value;
            keys.push(newKey);
            duplicates = keys.filter(x => x == newKey).length;

            if (duplicates > 1) {
              newKey += String.fromCharCode(95+duplicates);
            }
          }
        }

        if (newKey && newKey.trim() != "") {
          entry.key = newKey;
        }


        entryStrings.push({key: newKey, string: `@${entry.type}{${entry.key},\n${entryString.join(",\n")}\n}`});
      }

      // entryStrings.sort((a, b) => (a.key > b.key) ? 1 : -1);
      entryStrings = entryStrings.map(x => x.string);

      comments = bibtexParse.parse(editor.getText()).filter(entry => entry.itemtype == "comment" && entry.comment.trim() != "").map(entry => entry.comment).join("\n\n")

      if (editor) {
        editor.setText(comments + "\n" + entryStrings.join("\n\n"));
        editor.save();
      }
    }
  },

  bibtify() {
    const editor = atom.workspace.getActiveTextEditor();
    const entries = bibtexParse.parse(editor.getText()).filter(entry => entry.itemtype == "entry");
    entries.sort((a, b) => (a.key > b.key) ? 1 : -1);

    console.log(entries);

    if (entries.length > 0) {
      var entryStrings = []
      var keys = []

      for (const i in entries) {
        const entry = entries[i];

        entry.fields.sort((a, b) => (a.name > b.name) ? 1 : -1);

        const entryString = [];
        var newKey = null;

        for (k in entry.fields) {
          const key = entry.fields[k];
          entryString.push(`  ${key.name.toLowerCase()} = {${key.value}}`);
        }

        entryStrings.push({key: newKey, string: `@${entry.type}{${entry.key},\n${entryString.join(",\n")}\n}`});
      }

      entryStrings = entryStrings.map(x => x.string);

      if (editor) {
        editor.setText(entryStrings.join("\n\n"));
        editor.save();
      }
    }
  }

};
