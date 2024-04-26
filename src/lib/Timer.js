// SPDX-FileCopyrightText: 2023 Deminder <tremminder@gmail.com>
// SPDX-License-Identifier: GPL-3.0-or-later

/* exported Timer */
const Me = imports.misc.extensionUtils.getCurrentExtension();
const { RootMode, ScheduleInfo, Convenience } = Me.imports.lib;
const { EventEmitter } = imports.misc.signals;
const { logDebug } = Convenience;

const { GObject, Gio } = imports.gi;

var Timer = class extends EventEmitter {
  constructor() {
    super();
    this._cancellable = null;
    this.stopTimer();
  }

  adjustTo(info) {
    const newDeadline = info.deadline !== this.info.deadline;
    this.info = info;
    if (newDeadline) {
      // Restart timer for new deadline
      if (this._cancellable !== null) this._cancellable.cancel();
      else this.updateTimer();
    }
  }

  stopTimer() {
    if (this._cancellable !== null) this._cancellable.cancel();
    this.info = new ScheduleInfo.ScheduleInfo({ mode: 'shutdown' });
  }

  async updateTimer() {
    if (this._cancellable !== null) return;
    if (this.info.scheduled) {
      logDebug(
        `Started timer: ${this.info.minutes}min remaining (deadline: ${this.info.deadline})`
      );
      this._cancellable = new Gio.Cancellable();
      try {
        await Convenience.sleepUntilDeadline(
          this.info.deadline,
          this._cancellable
        );
      } catch (err) {
        logDebug(
          `Canceled delayed action: ${this.info.minutes}min remaining`,
          err
        );
      }
      this._cancellable = null;
      this.emit('action');
    } else {
      logDebug(
        `Stopped timer: ${this.info.minutes}min remaining (deadline: ${this.info.deadline})`
      );
    }
  }
};
