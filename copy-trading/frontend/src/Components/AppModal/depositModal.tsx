import styled from "styled-components";
import { CrossContainer, monoSpace, Row } from "../../styles/CommonStyles";
import AppStore from "../../Store/AppStore";
import { useRouter } from "next/router";
import Pressable from "../PressableButton/Pressable";
import { CrossIcon } from "../Icons/Icon";
import Image from "next/image";
import { useState } from "react";
import { inject, observer } from "mobx-react";

const Container = styled.div``;

const Heading = styled.div`
  color: #fff;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
  letter-spacing: 0.4px;
`;

const HeadRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 0px 0px 25px;
  border-bottom: 1px solid rgba(242, 242, 242, 0.1);
`;

const _MaxButton = styled.div`
  border-radius: 100px;
  background: #fff;
  display: flex;
  height: 33px;
  padding: 10px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: #000;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%; /* 21px */
`;

const _AmountTxt = styled.div`
  color: #fff;
  font-size: 30px;
  font-style: normal;
  font-weight: 700;
  line-height: 33px; /* 110% */
  letter-spacing: 0.4px;
`;

const _AmountContainer = styled.div`
  border-radius: 12px;
  background: var(--color-border);
  backdrop-filter: blur(56.041664123535156px);
  display: flex;
  padding: 16px 20px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 13px;
  align-self: stretch;
`;

const _Subtxt = styled.div`
  color: #787878;
  text-align: right;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 160%; /* 22.4px */
  letter-spacing: 0.4px;

  span {
    color: #fff;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px 25px;
`;

const CardImage = styled(Image)`
  display: flex;
  width: 100%;
`;

const _ButtonCta = styled.div<{ disabled?: boolean }>`
  display: flex;
  height: 50px;
  padding: 10px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  background: linear-gradient(66deg, #ffdca2 3.03%, #8df 96.42%), #212121;
  color: #000;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%; /* 21px */
  width: 100%;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
`;

const _InputField = styled.input`
  outline: none;
  border: none;
  background-color: transparent;
  width: 100%;
  flex-shrink: inherit;
  padding: 0;
  color: #f8f8f8;
  font-size: 30px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: 0.4px;
  max-width: 40px;
  flex: 0 1 auto; /* Allow input to shrink and grow naturally */
  ${monoSpace}
  &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }

  &::placeholder {
    color: white;
  }

  &:-ms-input-placeholder {
    color: white;
  }

  &::-ms-input-placeholder {
    color: white;
  }
`;

const DepositModal = () => {
  const router = useRouter();
  const [_depositAmount, _setDepositAmount] = useState<number>();

  let _disableCTA = false;
  let _CTA = "Deposit";

  if (!_depositAmount) {
    _disableCTA = true;
    _CTA = "Enter Amount";
  } else {
    _CTA = "Deposit";
  }

  return (
    <Container>
      <HeadRow>
        <Heading>Deposit</Heading>
        <Row>
          <Row
            onClick={() => {
              AppStore.closeModal("depositModal");
              router.push({
                pathname: "/portfolio",
                query: { tab: "history" },
              });
            }}
            style={{ cursor: "pointer", marginRight: "20px" }}></Row>
          <CrossContainer>
            <Pressable
              onClick={() => {
                AppStore.closeModal("depositModal");
              }}>
              <CrossIcon width={12} height={12} />
            </Pressable>
          </CrossContainer>
        </Row>
      </HeadRow>
      <CardImage src={'./logo'} alt='bg' width={100} />

      <Body>
        
      </Body>
    </Container>
  );
};

export default inject("appStore")(observer(DepositModal));
