package br.senac.sp.bookverse;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RequirementsMatrixTest {

    @Test
    void deveDisponibilizarAMatrizDeRequisitosParaVisualizacao() throws IOException {
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream("requirements-matrix.md")) {
            assertNotNull(inputStream, "O arquivo requirements-matrix.md deve existir em src/test/resources.");
            String conteudo = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);

            assertTrue(conteudo.contains("RF01"), "A matriz precisa conter o RF01.");
            assertTrue(conteudo.contains("RF15"), "A matriz precisa conter o RF15.");

            System.out.println("\n=== requirements-matrix.md ===\n");
            System.out.println(conteudo);
        }
    }
}

