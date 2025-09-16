import styled from "styled-components";
import { rowCenter } from "../../styles/CommonStyles";
import AppStore from "../../Store/AppStore";
import { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { ScreenSize } from "../../config/enums";
import DepositModal from "./depositModal";

const PopupContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  z-index: 20;
  backdrop-filter: blur(5px);
  background-color: ${({ theme }) => theme.colors.overlay};
  opacity: 1;

  /* animation: appear 0.2s ease-in-out; */
  @keyframes appear {
    0% {
      /* background-color: rgba(0, 0, 0, 0); */
      opacity: 0;
    }
    99% {
      /* background-color: rgba(0, 0, 0, 0.5); */
      opacity: 0.9;
    }
    100% {
      opacity: 1;
    }
  }
  @keyframes disappear {
    0% {
      /* background-color: rgba(0, 0, 0, 0); */
      opacity: 1;
    }
    99% {
      /* background-color: rgba(0, 0, 0, 0.5); */
      opacity: 0.1;
    }
    100% {
      opacity: 0;
    }
  }
  @media screen and (max-width: 992px) {
    z-index: 50;
  }
`;

const Wrapper = styled.div`
  ${rowCenter}
  width: 100%;
  height: 100%;
`;

const PopupBlock = styled.div`
  width: 100%;
  /* max-height: 75%; */
  max-width: 357px;
  max-height: 624px;
  margin: 20px;
  /* padding: 25px; */
  // overflow: hidden;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: ${({ theme }) => (theme.mode === 'light' ? '0 20px 40px rgba(15, 23, 42, 0.15)' : '0 20px 40px rgba(0, 0, 0, 0.45)')};
  display: flex;
  justify-content: stretch;
  align-items: stretch;
  @keyframes openPopup {
    0% {
      scale: 0;
    }
    99% {
      scale: 1;
    }
    100% {
      scale: 1;
    }
  }
  @keyframes closePopup {
    0% {
      scale: 1;
    }
    99% {
      scale: 0;
    }
    100% {
      scale: 0;
    }
  }

  @media screen and (max-width: 992px) {
    position: fixed;
    left: 0;
    margin: 0;
    bottom: 0px;
    max-width: none;
    max-height: none;
    animation: openPopupMobile 300ms ease-in-out;
    border-radius: 20px 20px 0 0;
    @keyframes openPopup {
      0% {
        transform: translateY(100%);
      }
      100% {
        transform: translateY(0);
      }
    }

    @keyframes closePopup {
      0% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(100%);
      }
    }
  }
`;

const Scrollable = styled.div`
  // overflow-y: scroll;
  align-self: stretch;
  flex: 1;
  overflow: hidden;
  // background: #000;
`;

const AppModal = () => {
  const [open, setOpen] = useState(true);
  const modalStack = AppStore.modalStack;
  const atleastOneModalOpen = !!modalStack.length;
  const _isMobile = AppStore.screenSize === ScreenSize.MEDIUM;

  useEffect(() => {
    if (!atleastOneModalOpen) {
      if (open) {
        setTimeout(() => {
          setOpen(false);
        }, 200);
      }
    } else {
      setOpen(true);
    }
  }, [modalStack.length, open, atleastOneModalOpen]);

  if (!open) {
    return null;
  }

  return modalStack.map((modal) => (
    <PopupContainer
      key={modal}
      onClick={() => {
        AppStore.closeModal();
      }}
      style={{
        animation:
          !atleastOneModalOpen && open
            ? "disappear 0.2s ease-in-out"
            : "appear 0.2s ease-in-out",
      }}>
      <Wrapper>
        <PopupBlock
          onClick={(e) => {
            e.stopPropagation();
          }}
          style={{
            animation:
              !atleastOneModalOpen && open
                ? "closePopup 0.2s ease-in-out"
                : "openPopup 0.2s ease-in-out",
          }}>
          <Scrollable>
            {modal === "depositModal" ? (
              <DepositModal />
            ) : null}
          </Scrollable>
        </PopupBlock>
      </Wrapper>
    </PopupContainer>
  ));
};

export default inject("appStore")(observer(AppModal));
