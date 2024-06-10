'use client'
import React, {useState,useEffect} from 'react'
import Link from 'next/link'

type Course = {
    courseName:string,
    fallSem:boolean,
    springSem:boolean,
    fallGrade:number | null,
    springGrade:number | null,
    pointBoost:number
}

type Grade = {
    gradeLevel:string,
    courses:Course[],
}


export default function Calculator() {

    const [grades, setGrades] = useState<(Grade[])>([
        {gradeLevel:'Senior',courses:[{courseName:'',fallSem:false,springSem:false,fallGrade:null,springGrade:null, pointBoost:0}]},
        {gradeLevel:'Junior',courses:[{courseName:'',fallSem:false,springSem:false,fallGrade:null,springGrade:null, pointBoost:0}]},
        {gradeLevel:'Sophomore',courses:[{courseName:'',fallSem:false,springSem:false,fallGrade:null,springGrade:null, pointBoost:0}]},
        {gradeLevel:'Freshman',courses:[{courseName:'',fallSem:false,springSem:false,fallGrade:null,springGrade:null, pointBoost:0}]}
    ])

    const [GPA1,setGPA1]= useState<number>(0)
    const [GPA2,setGPA2]= useState<number>(0)

    useEffect(()=>{
        console.log(grades)

    },[grades])


    useEffect(()=>{
        const data = window.localStorage.getItem('TIGER_GPA_GRADES');
        if (data != null) {
            setGrades(JSON.parse(data))
        }
    },[])

    useEffect(()=>{
        window.localStorage.setItem('TIGER_GPA_GRADES', JSON.stringify(grades))
    }, [grades])

    useEffect(()=>{
        let GPA1Sum = 0;
        let GPA1Count = 0;

        let GPA2Sum = 0;
        let GPA2Count = 0;

        for (let i = 0; i < grades.length; i++) {
            if (handleCalculateGPA(grades[i].courses) != null && isNaN(handleCalculateGPA(grades[i].courses).gpa1) == false) {
                GPA1Sum += handleCalculateGPA(grades[i].courses).gpa1
                GPA1Count += 1
            }

            if (handleCalculateGPA(grades[i].courses) != null && isNaN(handleCalculateGPA(grades[i].courses).gpa2) == false) {
                GPA2Sum += handleCalculateGPA(grades[i].courses).gpa2
                GPA2Count += 1
            }
        }

        setGPA1(GPA1Sum / GPA1Count)
        setGPA2(GPA2Sum / GPA2Count)

    },[grades])

    const handleCalculateGPA = (courses: Course[]) => {
        let sem1GPA1Count = 0;
        let sem1GPA2Count = 0;
        let sem1Count = 0;

        let sem2GPA1Count = 0;
        let sem2GPA2Count = 0;
        let sem2Count = 0;


        const gradeToGPA1 = (grade:number | null) => {
            if (grade) {
                if (grade >= 90) return 4.0;
                if (grade >= 80) return 3.0;
                if (grade >= 70) return 2.0;
                if (grade >= 60) return 1.0;
            }
            return 0.0;
        };

        const gradeToGPA2 = (grade:number | null, pointBoost:number) => {
            if (grade) {
                let numToSubtract = 0
                if (grade < 99) {
                    numToSubtract = ((99 - grade) / 10)
                } else if (grade >= 99) {
                    numToSubtract = 0;
                }

                return( (4 + pointBoost) - numToSubtract)
            }

            return 0.0
        }

        for (let i = 0; i < courses.length; i++) {
            if (courses[i].fallSem && courses[i].springSem) {
                if (courses[i].fallGrade && courses[i].springGrade) {
                    sem1GPA1Count += (gradeToGPA1(courses[i].fallGrade) + courses[i].pointBoost)
                    sem1GPA2Count += gradeToGPA2(courses[i].fallGrade, courses[i].pointBoost)
                    sem1Count += 1

                    sem2GPA1Count += (gradeToGPA1(courses[i].springGrade) + courses[i].pointBoost)
                    sem2GPA2Count += gradeToGPA2(courses[i].springGrade, courses[i].pointBoost)
                    sem2Count += 1
                }
            } else if (courses[i].fallSem && !courses[i].springSem) {
                if (courses[i].fallGrade) {
                    sem1GPA1Count += (gradeToGPA1(courses[i].fallGrade) + courses[i].pointBoost)
                    sem1GPA2Count += gradeToGPA2(courses[i].fallGrade, courses[i].pointBoost)
                    sem1Count += 1
                }
            } else if (!courses[i].fallSem  && courses[i].springSem) {
                if (courses[i].springGrade) {
                    sem2GPA1Count += (gradeToGPA1(courses[i].springGrade) + courses[i].pointBoost)
                    sem2GPA2Count += gradeToGPA2(courses[i].springGrade, courses[i].pointBoost)
                    sem2Count += 1
                }
            }
        }

        const gpa1 = (( (sem1GPA1Count / sem1Count) + (sem2GPA1Count / sem2Count) ) / 2)
        const gpa2 = (( (sem1GPA2Count / sem1Count) + (sem2GPA2Count / sem2Count) ) / 2)
    
        return { gpa1, gpa2 };
    };

    const handleEditCourse = (gradeLevel: string, courseIndex: number, courseEditCategory: keyof Course, newValue: any) => {
        setGrades(prevGrades => {
            return prevGrades.map(grade => {
                if (grade.gradeLevel === gradeLevel) {
                    return {
                        ...grade,
                        courses: grade.courses.map((course, index) => {
                            if (index === courseIndex) {
                                return {
                                    ...course,
                                    [courseEditCategory]: newValue
                                };
                            }
                            return course;
                        })
                    };
                }
                return grade;
            });
        });
    };


    const handleAddCourse = (gradeLevelName:string) => {
        let newCourse:Course
        let newCourses:Course[]
        let newGrade:Grade

        for (let i = 0; i < grades.length; i++) {
            if (grades[i].gradeLevel === gradeLevelName) {
                newCourse = {courseName:'',fallSem:false,springSem:false,fallGrade:null, springGrade:null,pointBoost:0}
                newCourses = [...grades[i].courses,newCourse]
                newGrade = {gradeLevel:gradeLevelName,courses:newCourses}
            }
        }

        setGrades(prevGrades => {
            let prevGradesArray = []
            for (let i = 0; i < prevGrades.length; i++) {
                if (prevGrades[i].gradeLevel === gradeLevelName) {
                    prevGradesArray.push(newGrade)
                } else {
                    prevGradesArray.push(prevGrades[i])
                }
            }
            return prevGradesArray;
        })
    }

    return (
        <section className='flex flex-col gap-10 m-auto p-2 py-16'>
            <header className='flex flex-col gap-1 text-center'>
                <h1 className='font-semibold text-3xl lg:text-4xl'> 
                    <img src='/tiger-logo.png' className='inline w-10 h-10'/> Tiger GPA Calculator
                </h1>
                <p className='opacity-75'>Made with ❤️ by <Link target='_blank' className='hover:opacity-75 underline underline-offset-4' href='https://kyraezikeuzor.vercel.app/'>Kyra Ezikeuzor</Link>, St. Agnes Academy &apos;25.</p>
            </header>

            <div className=''>
                <h2 className='font-semibold text-lg'>What to know:</h2>
                <ul className='ml-5 '>
                    <li className='list-disc '>St. Agnes Academy calculates two GPAs: GPA 1 and GPA 2.</li>
                    <li className='list-disc'>GPA 1 is based on your letter grades and weighted classes.</li>
                    <li className='list-disc'>GPA 2 is based on your numerical grades and weighted classes.</li>
                    <li className='list-disc'>The method for calculating both GPAs is in the SAA school planner.</li>
                </ul>
                <br/>
                <h2 className='font-semibold text-lg'>How to use:</h2>
                <ul className='ml-5 '>
                    <li className='list-disc'>Input <b>all</b> information for each course below.</li>
                    <li className='list-disc'>Make sure to select which semesters you took a course.</li>
                    <li className='list-disc'>For a semester in which you didn&apos;t take a course, keep the Fall/Spring Grade value <b>empty</b>.</li>
                </ul>
            </div>

            <div className='w-full flex flex-col gap-5'> 
                <h2 className='font-semibold text-xl lg:text-2xl'>Cumulative Grades</h2>
                <div className='flex flex-col gap-2'>
                    <span className='font-semibold text-lg opacity-75'>Your GPA 1: <span className='text-[--clr-green-base] opacity-100'>{isNaN(GPA1) == true ? 0 : GPA1}</span></span>
                    <span className='font-semibold text-lg opacity-75'>Your GPA 2: <span className='text-[--clr-green-base] opacity-100'>{isNaN(GPA2) == true ? 0 : GPA2}</span></span>
                </div>
            </div>
            
            {grades.map((grade,index)=>(
            <section key={index} className='w-full flex flex-col gap-5 '>
                <h2 className='font-semibold text-xl lg:text-2xl'>{grade.gradeLevel} Year Grades</h2>

                {grade.courses.length != 0 && 
                <section className='flex flex-col gap-2 rounded-lg border-2 border-[--clr-purple-base] p-3'>
                    <table>
                        <thead>
                            <th>Course</th>
                            <th>Type</th>
                            <th>Fall</th>
                            <th>Spring</th>
                            <th>Fall Grade</th>
                            <th>Spring Grade</th>
                        </thead>

                        {grade.courses.map((course,index)=>(
                            <tr key={index}>
                                <td className='w-3/12'>
                                    <input 
                                    value={course.courseName} 
                                    onChange={(e)=>{handleEditCourse(grade.gradeLevel,index,'courseName',e.target.value,)}} 
                                    className='w-full' 
                                    type='text'
                                    />
                                </td>
                                <td className='w-3/12'>
                                    <select className='w-full' onChange={(e)=>{handleEditCourse(grade.gradeLevel,index,'pointBoost',parseFloat(e.target.value))}} >
                                        <option value={0}>Regular</option>
                                        <option value={0.5}>Advanced</option>
                                        <option value={1}>Honors</option>
                                        <option value={1}>AP And Honors</option>
                                        <option value={0.5}>AP But Not Honors</option>
                                    </select>
                                </td>
                                <td className='w-1/12'>
                                    <input className='w-full' type='checkbox' onChange={(e)=>{handleEditCourse(grade.gradeLevel,index,'fallSem',e.target.checked)}} />
                                </td>
                                <td className='w-1/12'>
                                    <input className='w-full' type='checkbox' onChange={(e)=>{handleEditCourse(grade.gradeLevel,index,'springSem',e.target.checked)}} />
                                </td>
                                <td className='w-2/12'>
                                    <input className='w-full' type='number' name='fallGrade' min="1" max="120" step="1" onChange={(e)=>{handleEditCourse(grade.gradeLevel,index,'fallGrade',parseFloat(e.target.value))}} />
                                </td>
                                <td className='w-2/12'>
                                    <input className='w-full' type='number' name='springGrade' min="1" max="120" step="1" onChange={(e)=>{handleEditCourse(grade.gradeLevel,index,'springGrade',parseFloat(e.target.value))}} />
                                </td>
                            </tr>
                        ))}
                    </table>
                    
                </section>
                }

                <button onClick={()=>handleAddCourse(grade.gradeLevel)} className='bg-[--clr-purple-base] text-white rounded-lg px-4'>
                    Add a Course +
                </button>

                <div className='flex flex-col gap-2'>
                    <span className='font-semibold text-lg opacity-75'>Your GPA 1: <span className='text-[--clr-green-base] opacity-100'>{isNaN(handleCalculateGPA(grade.courses).gpa1) == true ? 0 : handleCalculateGPA(grade.courses).gpa1}</span></span>
                    <span className='font-semibold text-lg opacity-75'>Your GPA 2: <span className='text-[--clr-green-base] opacity-100'>{isNaN(handleCalculateGPA(grade.courses).gpa2) == true ? 0 : handleCalculateGPA(grade.courses).gpa2}</span></span>
                </div>

            </section>
            ))}
        </section>
    )
}

