import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 4rem 1rem;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 30%, var(--color-background)) 0%, var(--color-background) 100%);
  color: var(--color-nav-text);
  text-align: center;
  gap: 1rem;
`;
export default function Home() {
  return (
    <div>
      <Container>Main cont</Container>
    </div>
  );
}
