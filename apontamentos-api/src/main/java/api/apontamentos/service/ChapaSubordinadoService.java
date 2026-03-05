package api.apontamentos.service;

import java.util.List;

import org.springframework.stereotype.Service;

import api.apontamentos.entity.ChapaSubordinado;
import api.apontamentos.entity.SubordinadoSup;
import api.apontamentos.entity.Usuarios;
import api.apontamentos.repository.ChapaSubordinadoRepository;
import api.apontamentos.repository.SubordinadoSupRepository;
import api.apontamentos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
public class ChapaSubordinadoService {

    private final ChapaSubordinadoRepository repository;
    private final SubordinadoSupRepository subordinadoSupRepository;
    private final UsuarioRepository usuarioRepository;

    public List<ChapaSubordinado> buscarChapaPorSuperior(Long id){
        Usuarios usuario = usuarioRepository.findById(id).orElse(null);
        List<SubordinadoSup> subordinados = subordinadoSupRepository.findBySuperiorId_IdAndDataExclusaoNull(usuario.getId());
        List<String> chapas = subordinados.stream().map(SubordinadoSup::getSubordinadoChapa).toList();
        System.out.println("Chapas encontradas: " + chapas);
        List<ChapaSubordinado> chapaSubordinados = repository.findByChapaIn(chapas);
        System.out.println(chapaSubordinados);
        return chapaSubordinados;
        // for (SubordinadoSup subordinado : subordinados) {
        //     String chapaSubordinado = subordinado.getSubordinadoChapa();
        //     ChapaSubordinado chapa = repository.findByChapa(chapaSubordinado);
        //     if (chapa != null) {

        //     }
        // }

    }

}
