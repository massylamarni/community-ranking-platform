package fr.numeronumber1.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fr.numeronumber1.dto.response.RankingItemResponse;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.OeuvreRepository;

@Service
public class RankingService {

    private final OeuvreRepository oeuvreRepository;

    public RankingService(OeuvreRepository oeuvreRepository) {
        this.oeuvreRepository = oeuvreRepository;
    }

    @Transactional(readOnly = true)
    public Page<RankingItemResponse> getRanking(Integer categoryId, Pageable pageable) {
        Page<Oeuvre> page = (categoryId != null)
                ? oeuvreRepository.findByStatusAndCategoryIdOrderByScoreDesc(OeuvreStatus.approved, categoryId, pageable)
                : oeuvreRepository.findByStatusOrderByScoreDesc(OeuvreStatus.approved, pageable);

        int startPosition = pageable.getPageNumber() * pageable.getPageSize() + 1;
        List<RankingItemResponse> items = new ArrayList<>();

        List<Oeuvre> oeuvres = page.getContent();
        for (int i = 0; i < oeuvres.size(); i++) {
            Oeuvre oeuvre = oeuvres.get(i);
            int position = startPosition + i;
            items.add(new RankingItemResponse(oeuvre, oeuvre.getScore(), position));
        }

        return new PageImpl<>(items, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<RankingItemResponse> getGlobalRanking(Pageable pageable) {
        return getRanking(null, pageable);
    }
}


