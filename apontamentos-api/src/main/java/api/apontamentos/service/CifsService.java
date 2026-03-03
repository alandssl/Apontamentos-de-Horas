package api.apontamentos.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import api.apontamentos.entity.Cifs;
import api.apontamentos.entity.UsuarioCif;
import api.apontamentos.repository.CifsRepository;
import api.apontamentos.repository.UsuarioCifRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CifsService {

    private final CifsRepository repository;
    private final UsuarioCifRepository usuarioCifRepository;

    public List<Cifs> findAllCifs() {
        return repository.findAll();
    }

    public Cifs salvarCif(Cifs cif) {
        return repository.save(cif);
    }

    public void deletarCif(String codccusto) {
        repository.deleteById(codccusto);
    }

    public List<UsuarioCif> achaUsuarioCifs(Long id) {
        List<UsuarioCif> usuarioCifs = usuarioCifRepository.findByUsuarioId_Id(id);
        return usuarioCifs;
    }

    public List<Cifs> findByUsuarioId(Long id) {
        List<UsuarioCif> usuarioCifs = usuarioCifRepository.findByUsuarioId_Id(id);
        List<Cifs> cifs = new ArrayList<>();
        usuarioCifs.forEach(usuarioCif -> {
            cifs.addAll(repository.findByCodccustoContaining(usuarioCif.getCif()));
            // temp.forEach(cif -> cifs.add(cif)); });

        });
        return cifs;
    }
    // 1. Busca as associações (View ou Tabela intermediária)
    // List<UsuarioCif> usuarioCifs = usuarioCifRepository.findById(id);

    // 2. Extrai apenas os códigos CIF para uma lista de Strings
    // List<String> listaCodigos = usuarioCifs.stream()
    // .map(UsuarioCif::getCif)
    // .toList();

    // // 3. Busca todos os Cifs de uma vez só
    // // O retorno aqui já é uma List<Cifs>, compatível com o retorno do método
    // return repository.findAllByCodccustoContaining(listaCodigos);
}
