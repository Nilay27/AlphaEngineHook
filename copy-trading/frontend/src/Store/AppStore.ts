import { makeAutoObservable } from "mobx";
import { ScreenSize } from "../config/enums";

export type ModalType = "depositModal" | "withdrawModal" | "faucetModal";

class AppMobxStore {
  screenSize: ScreenSize = ScreenSize.LARGE;
  modalStack: ModalType[] = [];

  constructor(){
    makeAutoObservable(this);
  }

  closeModal = (modal?: ModalType) => {
    if (modal) {
        this.modalStack = this.modalStack.filter((m) => m !== modal);
    } else {
        this.modalStack.pop();
    }
};

openModal = (modal: ModalType) => {
    if (
        this.modalStack.length &&
        this.modalStack[this.modalStack.length - 1] === modal
    ) {
        return;
    }
    const value = [...this.modalStack.filter((m) => m !== modal)];
    this.modalStack = [...value, modal];
};
}
const AppStore = new AppMobxStore();

export default AppStore;
