import '../styles/home.scss';

export function Home() {
  return (
    <div className="home">
      <div className="title">
        <p>
          A <span className="cursive">Discipline Mentor</span> for people and
          routines
        </p>
        <p>that move forward with clarity and consistency.</p>
      </div>
      <div className="intro">
        <div className="name">
          <h1 className="name">Arveen Poonia</h1>
        </div>
        <div className="bottom-links">
          <div className="left-links">
            <p>INDIA 11:11</p>
          </div>
          <div className="center-links">
            <a href="#">YouTube</a>
            <p>/</p>
            <a href="#">Instagram</a>
          </div>
          <div className="right-links">
            <a href="#">HOME</a>
            <p>/</p>
            <a href="#">YOGA</a>
            <p>/</p>
            <a href="#">STORE</a>
            <p>/</p>
            <a href="#">CONTACT</a>
          </div>
        </div>
      </div>
    </div>
  );
}
