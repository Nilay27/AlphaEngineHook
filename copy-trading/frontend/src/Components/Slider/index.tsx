import { pointer } from "../../styles/CommonStyles";
import React from "react";
import styled from "styled-components";
// import dotImage from '@/assets/Selection.svg';

const SliderContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const _SliderLabel = styled.div`
  color: #9b9b9b;
  font-size: 15px;
  font-weight: 400;
`;

const SliderInputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
`;

const SliderCover = styled.div<{ value: number }>`
  position: absolute;
  top: 50%;
  left: 0;
  width: ${({ value }) => value}%;
  height: 41px;
  background: #fff;
  opacity: 0.1;
  transform: translateY(-50%);
  z-index: 2;
  border-radius: 20px;
  /* border-top-right-radius: ${(props) =>
    props.value > 30 ? `${5 * (props.value / 25)}px` : "0px"};
  border-bottom-right-radius: ${(props) =>
    props.value > 30 ? `${5 * (props.value / 25)}px` : "0px"}; */
`;

const SliderInput = styled.input.attrs({
  type: "range",
})`
  -webkit-appearance: none;
  width: 100%;
  height: 41px;
  background: transparent;
  outline: none;
  position: relative;
  z-index: 2;
  margin: 0;
  ${pointer}
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 35px;
    height: 41px;
    border-radius: 100px;
    /* background: rgba(217, 217, 217, 0.1); */
    cursor: pointer;
    position: relative;
    background-image: url("asset/Selection.svg");
    background-position: center;
    background-repeat: no-repeat;
    z-index: 3;
  }

  &::-moz-range-thumb {
    width: 35px;
    height: 41px;
    border-radius: 100px;
    /* background: rgba(217, 217, 217, 0.1); */
    cursor: pointer;
    position: relative;
    z-index: 3;
    background-image: url("asset/Selection.svg");
    background-position: center;
    background-repeat: no-repeat;
  }
`;

const DottedLine = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  width: 95%;
  height: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 1;
  & > div:first-child {
    opacity: 1;
    transform: translateX(15px);
  }
  & > div:last-child {
    opacity: 0.1;
  }
`;

const _LeverageValue = styled.div`
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  border-radius: 31px;
  border: 1px solid var(--color-background);
  background: #222;
  box-shadow: 0px 0px 10px 0px rgba(34, 34, 34, 0.04);
  /* padding: 7.5px 10px; */
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 50px;
  height: 40px;
`;

const Dot = styled.div<{ highlight: boolean }>`
  opacity: ${(props) => (props.highlight ? 1 : 0.1)};
  background: ${(props) => (props.highlight ? "#fff" : "#D9D9D9")};
  width: 5px;
  height: 5px;
  border-radius: 50%;
`;

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Slider: React.FC<SliderProps> = ({ min, max, step, value, onChange }) => {
  const percentage =
    value === 1
      ? 0
      : value === Math.ceil(max / 2)
      ? 52
      : max === 5 && value === 2
      ? 32
      : ((value - 0) / (max - 0)) * 100;

  return (
    <SliderContainer>
      <SliderInputContainer>
        <SliderCover value={percentage} />
        <DottedLine>
          {Array.from({ length: 5 }, (_, index) => {
            return (
              <Dot
                key={index}
                highlight={value > 1 && ((value / max) * 10 - 1) / 2 >= index}
              />
            );
          })}
        </DottedLine>
        <SliderInput
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={onChange}
                />
      </SliderInputContainer>
    </SliderContainer>
  );
};

export default Slider;
