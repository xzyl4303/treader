/*!
 * @license MPL-2.0-no-copyleft-exception
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as
 * defined by the Mozilla Public License, v. 2.0.
 */

import ReadSubPage from '../readsubpage.js';
import ReadPage from '../readpage.js';
import speech from '../../../text/speech.js';
import i18n from '../../../i18n/i18n.js';
import template from '../../../ui/util/template.js';

export default class ControlPage extends ReadSubPage {
  /**
   * @param {HTMLElement} container
   * @param {ReadPage} readPage
   */
  constructor(container, readPage) {
    super(container, readPage);
  }
  onFirstActivate() {
    super.onFirstActivate();

    const headerRef = template.create('header');
    this.container.insertBefore(headerRef.get('root'), this.container.firstChild);
    const backButton = template.iconButton('back', i18n.getMessage('buttonBack'));
    headerRef.get('left').appendChild(backButton);
    this.bookTitleElement = headerRef.get('mid');
    this.backButton = backButton;
    this.hide();

    this.coverElement = this.container.querySelector('.read-control-cover');

    const iconLine = this.container.querySelector('.icon-line');
    const genButton = (type, title) => {
      const item = iconLine.appendChild(document.createElement('div'));
      item.classList.add('icon-line-item');
      const button = item.appendChild(template.iconButton(type, title));
      return button;
    };
    this.contentsButton = genButton('contents', i18n.getMessage('buttonContents'));
    this.bookmarkButton = genButton('bookmark', i18n.getMessage('buttonBookmark'));
    this.searchButton = genButton('search', i18n.getMessage('buttonSearch'));
    this.jumpButton = genButton('jump', i18n.getMessage('buttonJump'));
    this.speechButton = genButton('speech', i18n.getMessage('buttonSpeech'));
    const stopIcon = template.icon('speech-stop', i18n.getMessage('buttonSpeechStop'));
    this.speechButton.querySelector('.icon').after(stopIcon);

    [
      { name: 'contents', button: this.contentsButton },
      { name: 'bookmark', button: this.bookmarkButton },
      { name: 'search', button: this.searchButton },
    ].forEach(({ name, button }) => {
      button.addEventListener('click', event => {
        this.hide();
        this.readPage.toggleIndexPage(name);
      });
    });
    this.jumpButton.addEventListener('click', event => {
      this.hide();
      this.readPage.showJumpPage();
    });
    this.speechButton.addEventListener('click', event => {
      this.hide();
      this.readPage.toggleSpeech();
    });
    this.backButton.addEventListener('click', event => {
      this.readPage.gotoList();
    });
    this.coverElement.addEventListener('touchstart', event => {
      event.preventDefault();
      window.requestAnimationFrame(() => { this.hide(); });
    });
    this.coverElement.addEventListener('mousedown', event => {
      if (event.button === 0) {
        window.requestAnimationFrame(() => { this.hide(); });
      }
    });

    const speechContainer = this.speechButton.closest('.icon-line-item');
    speechContainer.hidden = speech.getPreferVoice() == null;
    speech.onPreferVoiceChange(voice => {
      if (!voice) speechContainer.hidden = true;
      else speechContainer.hidden = false;
    });

    this.container.addEventListener('focusin', event => {
      this.hasFocus = true;
      this.container.classList.add('read-control-active');
    });
    this.container.addEventListener('focusout', event => {
      this.hasFocus = false;
      if (!this.isShow) this.container.classList.remove('read-control-active');
    });
  }
  onActivate() {
    super.onActivate();

    this.bookTitleElement.textContent = this.readPage.getMeta().title;
    this.bookTitleElement.lang = this.readPage.getLang();
    this.hide();
  }
  onInactivate() {
    super.onInactivate();

    this.hide();
  }
  hide() {
    this.isShow = false;
    this.container.classList.remove('read-control-active');
    if (this.hasFocus) {
      this.hasFocus = false;
      document.documentElement.focus();
    }
    this.readPage.textPage?.show();
  }
  show() {
    this.isShow = true;
    this.container.classList.add('read-control-active');
    this.readPage.textPage?.hide();
  }
  disable() {
    this.isEnabled = false;
    this.container.classList.add('read-control-disabled');
  }
  enable() {
    this.isEnabled = true;
    this.container.classList.remove('read-control-disabled');
  }
  focus() {
    this.backButton.focus();
  }
}
