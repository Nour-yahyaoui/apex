import React from "react";

const FreelancerHeroSection: React.FC = () => {
  return (
    <section style={styles.section}>
      {/* Left side - Illustration */}
      <div style={styles.imageContainer}>
        <img
          src="/image.png"
          alt="Freelancers working illustration"
          style={styles.image}
        />
      </div>

      {/* Right side - Content */}
      <div style={styles.content}>
        <h2 style={styles.title}>
          Trouver un freelance tunisien compétent sur notre plateforme
        </h2>

        <p style={styles.text}>
          <strong>Freelances.tn</strong> vous aide à trouver le freelance en
          Tunisie parfait pour votre projet, ou l’entreprise parfaite pour
          votre projet. Afin de trouver le freelance qu’il vous faut, vous avez
          juste à cliquer sur le bouton ci-dessous.
        </p>

        <button style={styles.button}>
          Publier un projet gratuitement
        </button>
      </div>
    </section>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  section: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "60px 80px",
    gap: "40px",
    flexWrap: "wrap",
  },
  imageContainer: {
    flex: 1,
    minWidth: "280px",
  },
  image: {
    width: "100%",
    maxWidth: "500px",
  },
  content: {
    flex: 1,
    minWidth: "280px",
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#1a5fb4",
    marginBottom: "20px",
  },
  text: {
    fontSize: "16px",
    color: "#555",
    lineHeight: 1.6,
    marginBottom: "30px",
  },
  button: {
    backgroundColor: "#5ed46a",
    color: "#fff",
    border: "none",
    padding: "14px 26px",
    borderRadius: "30px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default FreelancerHeroSection;