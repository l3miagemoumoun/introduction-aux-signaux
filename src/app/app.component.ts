import { ChangeDetectionStrategy, Component, NgZone, WritableSignal, computed, effect, signal } from '@angular/core';
import { DataService } from './data.service';

/**
 * tab : fonction utilitaire pour créer un tableau de T de taille length 
 *       dont les éléments sont calculés par la fonction f à partir de leur indice.
 * @param length la taille du tableau
 * @param f la fonction qui permet de calculer la valeur de chaque élément du tableau à partir de son indice
 * @returns un tableau de T de taille length
 */
function tab<T>(length: number, f: (i: number) => T): T[] {
  // à compléter
  return Array.from(Array(length), (_, i) => f(i))
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  /**
   * Question 1 : Définir un signal a produisant des number et initialisé à 0
   * Définir un signal b dérivé de a, produisant des tableau de string, de taille a(), 
   *                      chaque string représentant un nombre entier dans [0 et 100].
   * Définir un effet e qui affiche dans la console les signaux a et b précédés de "Question 1 :"
   * Faire varier la valeur de a de 1 à 3 par pas de 1, utilisez bien la méthode process de DataService
   * pour ajouter les actions à exécuter dans la file d'attente : 
   * for (let i = 1; i <= 3; i++) {
   *   this.ds.process( () => a.set(i) );
   * }
   * 
   *     Q1.1) Que constatez vous ?
   *     Q1.2) Dessinez le graphe des dépendances des signaux a et b ainsi que de l'effet e. 
   */
  question01() {
    function rand100(): string { // fonction utilitaire locale
      return Math.floor(Math.random() * 100).toString();
    }

    // à compléter
    const a = signal<number>(0);
    /*
      utilisez bien la méthode process de DataService
      pour ajouter les actions à exécuter dans la file d'attente
    */
    for (let i = 1; i <= 3; i++) {
      this.ds.process( () => a.set(i));
     }

     // a.set(100);
      
      //type tab = any;
      const b = computed<readonly string[]> ( () => {
        const res: string[] = [];
        for( let i = 0; i < a(); i++ ) {
          res.push(rand100());
        }
        return res;

      });
      
      const e = effect ( () => console.log("Qestion 1: ",a(), b()));
      //exécution de l'effet 
      e();
    }
  //DataService
  //ds: any;
         
  

  
  /**
   * Question 2 : En considérant les interfaces Student et StudentWithAverage ci-dessous ainsi que le tableau L,
   * Définir un signal students de readonly Student[], initialisé à L.
   * Définir un signal studentsWithAverage de readonly StudentWithAverage[] trié par ordre de moyenne décroissante, dérivé de students,
   * Définir un signal bestStudent qui identifie le meilleur élève (celui qui a la meilleure moyenne)
   * Définir un effet e qui affiche dans la console les signaux students, studentsWithAverage et bestStudent, précédé de "Question 2:"
   * Faire varier la valeur de students en ajoutant un élève à la fin du tableau, utilisez bien la méthode process de DataService
   *
   *     Q1.1) Que constatez vous ?
   *     Q1.2) Dessinez le graphe des dépendances des signaux students, studentsWithAverage et bestStudent ainsi que de l'effet e. 
  */
  question02() {
    interface Student {
      readonly name: string;
      readonly marks: readonly number[];
    }

    interface StudentWithAverage extends Student {
      readonly average: number; // moyenne des notes
      readonly pass: boolean;   // true si la moyenne est >= 10
    }

    const L: readonly Student[] = [
      { name: "Alice", marks: [10, 12, 14] },
      { name: "Bob", marks: [8, 9] },
      { name: "Charlie", marks: [16, 18, 20] },
      { name: "David", marks: [16, 18, 20, 12] },
      { name: "Eve", marks: [16, 18, 20, 12, 10] },
      { name: "Fred", marks: [16, 18, 20, 12, 10, 8] },
      { name: "Gloria", marks: [6, 12, 2, 12, 10, 8, 6] },
    ];

    // à compléter
    const students = signal <readonly Student[]>(L);
     //computed c'est pour cree un signla calcule qui depend du signal students 
 const studentsWithAverage = computed<readonly StudentWithAverage[]>(() => {
  return students()
    .map((student: Student) => ({ //obtenir la valeur actuelle du tab students 
      ...student, //utilisé pour copier toutes les propriétés de l'objet student 
      average: student.marks.reduce((acc, mark) => acc + mark, 0) / student.marks.length, //il calcule la moy avec reduce sur les marks il additionne toutes les notes puis on devise par le nombre total de notes 
      pass: student.marks.reduce((acc, mark) => acc + mark, 0) / student.marks.length >= 10 //on calcule la moyenne apres on determine si est >=10
    }))
    .filter((student: StudentWithAverage) => student.pass) //on filtre que les etudiant qui ont reussi
    .sort((a: StudentWithAverage, b: StudentWithAverage) => b.average - a.average); //trie les notes des etudiant decroissant 
});
  
  const bestStudent = signal <StudentWithAverage> ( () => studentsWithAverage()[0]); //la meilleure note c'est du premier element du tab studentsWithAverage
    
  //Définir un effet
  const e = effect ( () => {
    console.log("Qestion 2: ");
    console.log("Students: ", students());
    console.log("StudentWithAverage: ", studentsWithAverage());
    console.log("bestStudent: ", bestStudent());
  });

   // Faire varier la valeur de students en ajoutant un élève à la fin du tableau, utilisez bien la méthode process de DataService
   DataService.process(() => {
    const newStudent: Student = { name: "Hank", marks: [15, 17, 18] };
    students([...students(), newStudent]);
  });


 
  }


  /**
   * Question 3 : On gère des station météo qui relève la température.
   * Chaque station météo est modélisée par un signal de type number qui produit la température relevée.
   * On dispose d'un tableau L de type StationMeteo[] qui produit la liste des stations météo.
   * 
   * Définir un signal relevé qui produit un tableau de {readonly name: string; readonly temperature: number} 
   *                  avec la température en °C et la liste triée par ordre alphabétique des noms de stations météo. 
   * Définir le signal moy de type number qui produit la température moyenne relevée par les stations météo de L (attention aux unités).
   * Définir un effet qui affiche dans la console les signaux relevé et moy, précédé de "Question 3:"
   * Faites varier les températures relevées par les stations météo (utilisez les méthodes set, update et mutate), 
   *                                                             utilisez bien la méthode process de DataService.
   * Faites varier la liste des stations météo, utilisez bien la méthode process de DataService
   *      
   *      Q3.1) Dessinez le graphe des dépendances des signaux relevé et moy ainsi que de l'effet e.
   *      Q3.2) Que constatez vous lorsque vous faites varier la liste des stations météo ?
   *      Q3.3) Expliquer d'où vient le problème et comment le régler ?
   */
  question03() {
    interface StationMeteo {
      readonly name: string;
      readonly temperature: WritableSignal< {value: number, unit: '°C' | '°K'} >;
    }

    const L: StationMeteo[] = [
      { name: "Paris", temperature: signal({value: 14, unit: '°C'}) },
      { name: "Lyon", temperature: signal({value: 18, unit: '°C'}) },
      { name: "Marseille", temperature: signal({value: 300, unit: '°K'}) },
    ];

    const sum: number = L.reduce((accumulator, currentValue) => accumulator + currentValue.temperature.value, 0);
    const moy: number= sum / L.length;

    for(let i=0; i<L.length; i++){
      effect(() => console.log(moy, L[i]));
    }

    L.push({name: "Le havre" , temperature: signal ( {value: 60, unit: '°C'}) });//ajouter une station 
    L.splice(1.1); //supprimer le 2eme station 
    mutate.L({})


   
   
  }














  /**
   * Le constructeur sert uniquement à exécuter les fonctions répondants aux questions.
   */
  constructor(private ds: DataService) {
    this.question01();
    this.question02();
    this.question03();
  }
  
}


//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

//Git
 // git config --global user.name "l3miagemoumoun"
 // git config --global user.email "nassima.moumou@etu.univ-grenoble-alpes.f"
 //git push
//git commit -m "Ajout du travail"
//git push



