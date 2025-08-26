import { Box, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        backgroundColor: "#000000",
        color: "#ffffff",
        py: 4,
        px: 2,
        mt: 6,
        textAlign: "center",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Skolprojekt Webshop
      </Typography>

      <Typography variant="body2" sx={{ mb: 1 }}>
        Detta är en fiktiv e-handelswebbplats skapad som ett skolprojekt.
        Bilderna är lånade från{" "}
        <Link
          href="https://dfyne.com/"
          color="#ffffff"
          underline="always"
          target="_blank"
        >
          Dfyne
        </Link>{" "}
        och används endast för skolprojektet.
      </Typography>

      <Typography variant="body2">
        &copy; {new Date().getFullYear()} Skolprojekt.
      </Typography>

      <Typography variant="body2" sx={{ mt: 1 }}>
        <Link href="#" color="#ffffff" underline="hover">
          Om projektet
        </Link>
        {" | "}
        <Link
          href="mailto:marizza.karlin@icloud.com"
          color="#ffffff"
          underline="hover"
        >
          Kontakt
        </Link>
      </Typography>
    </Box>
  );
}
